import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

class ReportService:
    @staticmethod
    def generate_pdf_report(student_name: str, inputs: dict, predictions: dict, recommendations: dict) -> io.BytesIO:
        """
        Generates a premium, medical-grade mental wellness PDF report for a student.
        Returns a BytesIO buffer containing the PDF bytes.
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=54,
            leftMargin=54,
            topMargin=54,
            bottomMargin=54
        )
        
        styles = getSampleStyleSheet()
        
        # Define Custom Color Palette (Modern Deep Indigo Theme)
        primary_color = colors.HexColor("#1E1B4B")  # Deep Indigo
        secondary_color = colors.HexColor("#4F46E5") # Bright Indigo
        text_color = colors.HexColor("#1F2937")      # Dark Grey
        accent_color = colors.HexColor("#EF4444")    # Red accent for high risk
        bg_light = colors.HexColor("#F9FAFB")        # Light background
        border_color = colors.HexColor("#E5E7EB")    # Border grey
        
        # Modify existing styles to avoid crash, or add new ones with unique names
        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=24,
            textColor=primary_color,
            spaceAfter=15
        )
        
        h2_style = ParagraphStyle(
            'ReportH2',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=16,
            textColor=secondary_color,
            spaceBefore=15,
            spaceAfter=8
        )
        
        body_style = ParagraphStyle(
            'ReportBody',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10.5,
            textColor=text_color,
            leading=15,
            spaceAfter=8
        )
        
        bullet_style = ParagraphStyle(
            'ReportBullet',
            parent=body_style,
            leftIndent=20,
            firstLineIndent=-10,
            spaceAfter=6
        )
        
        bold_body = ParagraphStyle(
            'ReportBodyBold',
            parent=body_style,
            fontName='Helvetica-Bold'
        )
        
        meta_style = ParagraphStyle(
            'ReportMeta',
            parent=styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=9,
            textColor=colors.HexColor("#4B5563"),
            spaceAfter=20
        )
        
        # Flowables list
        story = []
        
        # --- HEADER SECTION ---
        story.append(Paragraph("Student Mental Health & Stress Report", title_style))
        story.append(Paragraph(f"Generated on {datetime.now().strftime('%B %d, %Y')} | Platform: WellnessAI Predictor Engine", meta_style))
        story.append(Spacer(1, 10))
        
        # --- STUDENT METRICS TABLE ---
        story.append(Paragraph("Student Demographic & Lifestyle Profile", h2_style))
        
        diet_str = inputs['diet_quality'].capitalize()
        
        profile_data = [
            [
                Paragraph("<b>Student Name:</b>", bold_body), Paragraph(student_name, body_style),
                Paragraph("<b>Age / Gender:</b>", bold_body), Paragraph(f"{inputs['age']} years / {inputs['gender']}", body_style)
            ],
            [
                Paragraph("<b>Sleep Hours:</b>", bold_body), Paragraph(f"{inputs['sleep_hours']} hours / night", body_style),
                Paragraph("<b>Study Duration:</b>", bold_body), Paragraph(f"{inputs['study_hours']} hours / day", body_style)
            ],
            [
                Paragraph("<b>Screen Exposure:</b>", bold_body), Paragraph(f"{inputs['screen_time']} hours / day", body_style),
                Paragraph("<b>Physical Exercise:</b>", bold_body), Paragraph(f"{inputs['exercise_hours']} hours / day", body_style)
            ],
            [
                Paragraph("<b>Social Engagement:</b>", bold_body), Paragraph(f"Level {inputs['social_level']}/5", body_style),
                Paragraph("<b>Academic Pressure:</b>", bold_body), Paragraph(f"Level {inputs['academic_pressure']}/5", body_style)
            ],
            [
                Paragraph("<b>Attendance:</b>", bold_body), Paragraph(f"{inputs['attendance_pct']}%", body_style),
                Paragraph("<b>Dietary Quality:</b>", bold_body), Paragraph(diet_str, body_style)
            ],
            [
                Paragraph("<b>Financial Strain:</b>", bold_body), Paragraph(f"Level {inputs['financial_stress']}/5", body_style),
                Paragraph("<b>Relationship Strain:</b>", bold_body), Paragraph(f"Level {inputs['relationship_stress']}/5", body_style)
            ]
        ]
        
        profile_table = Table(profile_data, colWidths=[1.5*inch, 2.0*inch, 1.5*inch, 2.0*inch])
        profile_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), bg_light),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
            ('BOX', (0,0), (-1,-1), 1.0, primary_color),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))
        
        story.append(profile_table)
        story.append(Spacer(1, 20))
        
        # --- PREDICTED METRICS SECTION ---
        story.append(Paragraph("Machine Learning Diagnostic Summary", h2_style))
        
        stress_lbl = ["Low Stress", "Moderate Stress", "High Stress"][predictions['stress_level']]
        burnout_lbl = ["Low Burnout Risk", "Moderate Burnout Risk", "High Burnout Risk"][predictions['burnout_risk']]
        wellness_score = predictions['wellness_score']
        
        # Box background depending on stress levels
        stress_color = colors.HexColor("#10B981") # Green for Low
        if predictions['stress_level'] == 1:
            stress_color = colors.HexColor("#F59E0B") # Yellow
        elif predictions['stress_level'] == 2:
            stress_color = accent_color # Red
            
        burnout_color = colors.HexColor("#10B981")
        if predictions['burnout_risk'] == 1:
            burnout_color = colors.HexColor("#F59E0B")
        elif predictions['burnout_risk'] == 2:
            burnout_color = accent_color
            
        diagnostic_data = [
            [
                Paragraph("<b>Core Assessment</b>", bold_body),
                Paragraph("<b>Predicted Status</b>", bold_body),
                Paragraph("<b>Risk Flag</b>", bold_body)
            ],
            [
                Paragraph("Student Mental Wellness Score", body_style),
                Paragraph(f"<b>{wellness_score}/100</b>", body_style),
                Paragraph("<b>Healthy</b>" if wellness_score >= 70.0 else ("<b>Moderate</b>" if wellness_score >= 50.0 else "<b>Critical</b>"), body_style)
            ],
            [
                Paragraph("Stress Intensity Index", body_style),
                Paragraph(f"<b>{stress_lbl}</b>", body_style),
                Paragraph(f"<font color='{stress_color}'>■</font>", body_style)
            ],
            [
                Paragraph("Academic Burnout Risk", body_style),
                Paragraph(f"<b>{burnout_lbl}</b>", body_style),
                Paragraph(f"<font color='{burnout_color}'>■</font>", body_style)
            ]
        ]
        
        diagnostic_table = Table(diagnostic_data, colWidths=[2.5*inch, 2.5*inch, 2.0*inch])
        diagnostic_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), primary_color),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
            ('BOX', (0,0), (-1,-1), 1.0, primary_color),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
        ]))
        # We need to change the heading row text color to white
        for i in range(3):
            diagnostic_data[0][i].style.textColor = colors.white
            
        story.append(diagnostic_table)
        story.append(Spacer(1, 20))
        
        # --- AI RECOMMENDATIONS SECTION ---
        story.append(Paragraph("Personalized AI Wellness Recommendations", h2_style))
        story.append(Paragraph(recommendations['overall_summary'], body_style))
        story.append(Spacer(1, 8))
        
        story.append(Paragraph("<b>Healthy Routines:</b>", bold_body))
        for item in recommendations['routines']:
            story.append(Paragraph(f"• {item}", bullet_style))
        story.append(Spacer(1, 8))
            
        story.append(Paragraph("<b>Stress Reduction Tips:</b>", bold_body))
        for item in recommendations['stress_reduction']:
            story.append(Paragraph(f"• {item}", bullet_style))
        story.append(Spacer(1, 8))
            
        story.append(Paragraph("<b>Study-Life Balance Strategies:</b>", bold_body))
        for item in recommendations['study_balance']:
            story.append(Paragraph(f"• {item}", bullet_style))
        story.append(Spacer(1, 15))
        
        # --- DISCLAIMER ---
        story.append(Paragraph("<b>Disclaimer:</b> This report is generated by a calibrated machine learning engine (XGBoost/Random Forest) using academic and lifestyle correlates. It is designed for self-reflection and proactive coaching purposes and is NOT a medical diagnosis. If you are experiencing severe stress or psychological symptoms, please consult a qualified psychologist or your campus health services.", ParagraphStyle('Disclaimer', parent=body_style, fontSize=8, textColor=colors.HexColor("#6B7280"), spaceBefore=20)))
        
        # Build Document
        doc.build(story)
        buffer.seek(0)
        return buffer
