import re
import pdfplumber
import requests
from io import BytesIO
import json

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

# Replace with your actual Gemini API key.
GEMINI_API_KEY = "AIzaSyDCuedtf9Z87HdVac-YNB2pNnPH2CDOV2k"

def call_gemini_api(prompt, model="gemini-2.0-flash"):
    gemini_api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    params = {"key": GEMINI_API_KEY}
    headers = {"Content-Type": "application/json"}
    data = {"contents": [{"parts": [{"text": prompt}]}]}
    response = requests.post(gemini_api_url, params=params, headers=headers, json=data)
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": response.text}

def extract_pdf_content(file_obj):
    """
    Use pdfplumber to extract both unstructured text and tabular data from the PDF.
    """
    all_text = ""
    all_tables = []  # We'll store tables as a string joined by newlines

    with pdfplumber.open(BytesIO(file_obj.read())) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                all_text += page_text + "\n"
            # Extract tables from page
            tables = page.extract_tables()
            for table in tables:
                table_str = "\n".join([", ".join([cell.strip() if cell else "" for cell in row]) for row in table])
                all_tables.append(table_str)
    return all_text, all_tables

@api_view(['POST'])
@permission_classes([AllowAny])
def upload_policy_pdf(request):
    
    print("Request headers:", request.headers)
    print("Request method:", request.method)
    print("Request content type:", request.content_type)
    
    file_obj = request.FILES.get("file", None)
    if not file_obj:
        print("No file found in request.FILES:", request.FILES)
        return Response({"error": "No file provided."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        text_content, tables = extract_pdf_content(file_obj)
    except Exception as e:
        print(f"Error extracting PDF content: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    cleaned_text = re.sub(r'\s+', ' ', text_content).strip()
    # Store the complete text and joined table string in the session
    request.session["pdf_text"] = cleaned_text
    request.session["pdf_tables"] = "\n\n".join(tables) if tables else ""
    # Reset any previous policy extraction data
    request.session["policy_extraction"] = {}
    
    # Ensure session is saved
    request.session.save()
    print("Session key:", request.session.session_key)
    print("Session items:", dict(request.session.items()))

    return Response({
        "message": "Policy PDF processed successfully.",
        "text_length": len(cleaned_text),
        "tables_found": len(tables),
        "session_key": request.session.session_key  # Include session key in response
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def extract_policy_details(request):
    pdf_text = request.session.get("pdf_text", "")
    pdf_tables = request.session.get("pdf_tables", "")

    if not pdf_text:
        return Response({"error": "No PDF content found. Please upload a PDF first."},
                        status=status.HTTP_400_BAD_REQUEST)

    # For a concise prompt, use an excerpt from text and a brief part of the tables.
    selected_text = pdf_text[:1000]  # first 1000 characters of text
    selected_tables = pdf_tables[:500] if pdf_tables else ""

    prompt = f"""
You are a health insurance policy analyzer.
Analyze the following excerpt from a policy document and extract the key coverage details and exclusions.
Format your response strictly as valid JSON with the following keys:
  - "policy_number" (string, if available)
  - "coverage_details" (object with key-value pairs)
  - "exclusions" (array of strings)
  - "additional_info" (object)
Do not include any extra explanations.
---
[Text Excerpt]:
{selected_text}

[Table Excerpt]:
{selected_tables}
---
Return only the JSON output.
"""

    gemini_response = call_gemini_api(prompt)
    if "error" in gemini_response:
        return Response({"error": f"Gemini API error: {gemini_response['error']}"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    try:
        extracted_text = gemini_response.get("candidates", [{}])[0] \
            .get("content", {}) \
            .get("parts", [{}])[0] \
            .get("text", "").strip()
        # Remove potential markdown code block formatting and parse JSON
        json_str = extracted_text.replace("```json", "").replace("```", "").strip()
        extracted_json = json.loads(json_str)
    except Exception as e:
        return Response({"error": f"Error parsing Gemini response: {str(e)}"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Optional: store extracted details in session
    request.session["policy_extraction"] = extracted_json

    return Response(extracted_json, status=status.HTTP_200_OK)