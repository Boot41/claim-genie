import re
import pdfplumber
import requests
from io import BytesIO

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

def extract_pdf_content(file_obj):
    """Extracts both text and tables from the PDF using pdfplumber."""
    all_text = ""
    all_tables = []  # Save string representations of tables
    
    with pdfplumber.open(BytesIO(file_obj.read())) as pdf:
        print("DEBUG: Number of pages in PDF:", len(pdf.pages))
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if text:
                print(f"DEBUG: Extracted text from page {i+1} (length {len(text)}).")
                all_text += text + "\n"
            page_tables = page.extract_tables()
            print(f"DEBUG: Found {len(page_tables)} tables on page {i+1}.")
            for j, table in enumerate(page_tables):
                table_str = "\n".join([", ".join([cell.strip() if cell else "" for cell in row]) for row in table])
                all_tables.append(table_str)
                print(f"DEBUG: Extracted table {j+1} on page {i+1}:")
                print(table_str)
                
    return all_text, all_tables

@api_view(['POST'])
@permission_classes([AllowAny])
def upload_pdf(request):
    """Processes uploaded PDF and returns its text and tables so the client can store them."""
    print("DEBUG: In upload_pdf view.")
    file_obj = request.FILES.get('file', None)
    if not file_obj:
        print("ERROR: No file provided in request.FILES:", request.FILES)
        return Response({'error': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        text_content, tables = extract_pdf_content(file_obj)
        print("DEBUG: Extracted text length:", len(text_content))
        print("DEBUG: Extracted", len(tables), "tables.")
    except Exception as e:
        print("ERROR: Exception during PDF extraction:", str(e))
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    cleaned_text = re.sub(r'\s+', ' ', text_content).strip()
    pdf_tables = "\n\n".join(tables) if tables else ""
    
    print("DEBUG: Returning pdf_text (length =", len(cleaned_text),") and", len(tables), "tables.")
    
    # Return the extracted content so that the client can store it (e.g., in localStorage).
    return Response({
        'message': 'PDF processed successfully.',
        'text_length': len(cleaned_text),
        'tables_found': len(tables),
        'pdf_text': cleaned_text,
        'pdf_tables': pdf_tables
    }, status=status.HTTP_200_OK)

def call_gemini_api(prompt):
    """Calls the Gemini API with the provided prompt and returns the response."""
    gemini_api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
    params = {"key": "AIzaSyDCuedtf9Z87HdVac-YNB2pNnPH2CDOV2k"}  # Replace with your API key
    headers = {"Content-Type": "application/json"}
    data = {"contents": [{"parts": [{"text": prompt}]}]}
    
    print("DEBUG: Calling Gemini API with prompt:")
    print(prompt)
    
    response = requests.post(gemini_api_url, params=params, headers=headers, json=data)
    print("DEBUG: Gemini API response status code:", response.status_code)
    
    if response.status_code == 200:
        print("DEBUG: Gemini API response JSON:")
        print(response.json())
        return response.json()
    else:
        print("ERROR: Gemini API returned error:")
        print(response.text)
        return {"error": response.text}

@api_view(['POST'])
@permission_classes([AllowAny])
def query_pdf(request):
    """Handles a query against the previously uploaded PDF content.
    The client must include pdf_text, pdf_tables, and conversation_history."""
    print("DEBUG: In query_pdf view.")
    print("DEBUG: Request data:", request.data)
    
    user_question = request.data.get('question', None)
    if not user_question:
        print("ERROR: No question provided in request data!")
        return Response({'error': 'No question provided.'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Retrieve PDF content from client payload (previously stored in localStorage).
    pdf_text = request.data.get('pdf_text', "")
    pdf_tables = request.data.get('pdf_tables', "")
    if not pdf_text:
        print("ERROR: No PDF text provided in request data.")
        return Response({'error': 'No PDF text provided. Please upload a PDF first.'},
                        status=status.HTTP_400_BAD_REQUEST)
    
    # Optionally, include conversation history from the client.
    history = request.data.get('conversation_history', [])
    
    # For brevity, select only excerpts from text (and optionally tables).
    selected_text = pdf_text[:1000]  # For example, first 1000 characters
    selected_tables = pdf_tables[:1000] if pdf_tables else ""
    
    # Trim conversation history to the last 7 interactions.
    trimmed_history = history[-7:] if len(history) > 7 else history
    
    print("DEBUG: Conversation history (last 7, if any):")
    print(trimmed_history)
    
    # Updated system instruction.
    system_instruction = (
        "You are a health insurance policy expert. Provide a concise, user-friendly answer (2-4 lines) with an approximate calculation result in numbers. "
        "Do not overwhelm the customer with excessive detail. Ask follow-up questions only if absolutely necessary."
    )
    
    prompt = system_instruction + "\n\n"
    prompt += "[Policy Text (excerpt)]:\n" + selected_text + "\n\n"
    if selected_tables:
        prompt += "[Policy Tables (excerpt)]:\n" + selected_tables + "\n\n"
    
    if trimmed_history:
        prompt += "Recent Conversation History:\n"
        for turn in trimmed_history:
            prompt += f"User: {turn.get('question')}\nAgent: {turn.get('answer')}\n"
        prompt += "\n"
    
    prompt += "User: " + user_question + "\nAnswer (concise, approximate):"
    
    print("DEBUG: Constructed Gemini API prompt:")
    print(prompt)
    
    gemini_response = call_gemini_api(prompt)
    
    if "error" in gemini_response:
        model_response = f"Error from Gemini API: {gemini_response['error']}"
        print("ERROR: Gemini API returned an error:", gemini_response['error'])
    else:
        try:
            model_response = (
                gemini_response.get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", [{}])[0]
                .get("text", "No answer provided.")
            )
            print("DEBUG: Gemini API model response:", model_response)
        except Exception as e:
            model_response = f"Error parsing Gemini response: {str(e)}"
            print("ERROR: Exception parsing Gemini response:", str(e))
    
    # Return the answer. The client should update its conversation history (e.g., in localStorage).
    return Response({'prompt': prompt, 'answer': model_response}, status=status.HTTP_200_OK)