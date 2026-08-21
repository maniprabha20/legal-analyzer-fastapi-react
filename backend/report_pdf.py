from io import BytesIO

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    ListFlowable,
    ListItem,
)
from reportlab.lib.enums import TA_CENTER

from schemas import DocumentAnalysis


styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    "T",
    parent=styles["Title"],
    fontSize=16,
    alignment=TA_CENTER,
)

meta_style = ParagraphStyle(
    "M",
    parent=styles["Normal"],
    fontSize=9,
    textColor=colors.HexColor("#666666"),
    alignment=TA_CENTER,
    spaceAfter=16,
)

h2 = ParagraphStyle(
    "H2",
    parent=styles["Heading2"],
    fontSize=12,
    spaceBefore=14,
    spaceAfter=6,
)

body = ParagraphStyle(
    "B",
    parent=styles["Normal"],
    fontSize=10,
    leading=14,
    spaceAfter=6,
)

disclaimer_style = ParagraphStyle(
    "D",
    parent=styles["Normal"],
    fontSize=8.5,
    textColor=colors.HexColor("#8a6d3b"),
    spaceBefore=16,
)


def generate_report_pdf(
    analysis: DocumentAnalysis,
    document_filename: str,
    created_at,
) -> BytesIO:

    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        topMargin=0.8 * inch,
        bottomMargin=0.8 * inch,
        leftMargin=0.8 * inch,
        rightMargin=0.8 * inch,
    )

    story = []

    story.append(
        Paragraph(
            "AI Legal Document Analysis Report",
            title_style,
        )
    )

    story.append(
        Paragraph(
            f"Document: {document_filename} "
            f"&nbsp;|&nbsp; Generated: "
            f"{created_at.strftime('%B %d, %Y at %H:%M')}",
            meta_style,
        )
    )

    # Summary
    story.append(Paragraph("Summary", h2))
    story.append(Paragraph(analysis.summary, body))

    # Risks
    story.append(
        Paragraph(
            f"Risks ({len(analysis.risks)})",
            h2,
        )
    )

    if not analysis.risks:
        story.append(
            Paragraph(
                "No specific risks identified.",
                body,
            )
        )

    for r in analysis.risks:
        story.append(
            Paragraph(
                f"<b>[{r.risk_level.upper()}]</b> "
                f"{r.description} "
                f"(Page {r.page_number})",
                body,
            )
        )

    # Key Clauses
    story.append(
        Paragraph(
            f"Key Clauses ({len(analysis.key_clauses)})",
            h2,
        )
    )

    if not analysis.key_clauses:
        story.append(
            Paragraph(
                "No key clauses identified.",
                body,
            )
        )

    for c in analysis.key_clauses:
        story.append(
            Paragraph(
                f"<b>{c.title}</b> "
                f"(Page {c.page_number}): "
                f"{c.summary}",
                body,
            )
        )

    # Key Dates
    story.append(
        Paragraph(
            f"Key Dates ({len(analysis.key_dates)})",
            h2,
        )
    )

    if not analysis.key_dates:
        story.append(
            Paragraph(
                "No key dates identified.",
                body,
            )
        )

    for d in analysis.key_dates:
        story.append(
            Paragraph(
                f"<b>{d.date_or_deadline}</b> "
                f"(Page {d.page_number}): "
                f"{d.description}",
                body,
            )
        )

    # Payment Terms
    story.append(
        Paragraph(
            f"Payment Terms ({len(analysis.payment_terms)})",
            h2,
        )
    )

    if not analysis.payment_terms:
        story.append(
            Paragraph(
                "No payment terms identified.",
                body,
            )
        )

    for p in analysis.payment_terms:
        story.append(
            Paragraph(
                f"<b>{p.amount_or_terms}</b> "
                f"(Page {p.page_number}): "
                f"{p.description}",
                body,
            )
        )

    # Obligations
    story.append(
        Paragraph(
            f"Obligations ({len(analysis.obligations)})",
            h2,
        )
    )

    if not analysis.obligations:
        story.append(
            Paragraph(
                "No obligations identified.",
                body,
            )
        )

    for o in analysis.obligations:
        story.append(
            Paragraph(
                f"<b>{o.party}</b> "
                f"(Page {o.page_number}): "
                f"{o.description}",
                body,
            )
        )

    # Recommendations
    story.append(
        Paragraph(
            "Recommendations",
            h2,
        )
    )

    if not analysis.recommendations:
        story.append(
            Paragraph(
                "No recommendations.",
                body,
            )
        )
    else:
        story.append(
            ListFlowable(
                [
                    ListItem(
                        Paragraph(rec, body)
                    )
                    for rec in analysis.recommendations
                ],
                bulletType="bullet",
            )
        )

    # Disclaimer
    story.append(
        Paragraph(
            analysis.disclaimer,
            disclaimer_style,
        )
    )

    doc.build(story)

    buffer.seek(0)

    return buffer