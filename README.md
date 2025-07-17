# Amazing Budget 🤖


## 🌟 Overview

## ✨ Key Features

### 🔐 Authentication System
* User Registration & Login: Users can sign up and log in using email/password authentication via Firebase
* Session Management: Automatic login state tracking and logout functionality
* Protected Routes: Backend endpoints that require authentication tokens

### 📸 Receipt Image Analysis
* Image Upload: Users can upload receipt images through a file picker
* Image Preview: Shows a preview of the selected image before analysis
* AI-Powered Analysis: Uses Google's Gemini AI model to analyze receipt images
* Receipt Breakdown: The AI extracts and itemizes:
  - Individual items and their costs
  - Total amount spent
  - Clear breakdown of all expenses

## Current Workflow
* User signs up/logs in with email and password
* User uploads a receipt image
* Image is sent to the backend and stored in a dataset directory
* Backend uses Gemini AI to analyze the receipt
* Analysis results are returned showing itemized costs and total amount
* Results are displayed to the user in a formatted way

image.png