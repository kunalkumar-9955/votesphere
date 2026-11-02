"""PDF report generation using ReportLab."""
from io import BytesIO
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from sqlalchemy.orm import Session


def generate_election_report(db: Session, election_id: int) -> bytes:
    from app.models.election import Election, Candidate, Vote, Result

    election = db.query(Election).filter(Election.id == election_id).first()
    if not election:
        raise ValueError("Election not found")

    candidates = db.query(Candidate).filter(Candidate.election_id == election_id).all()
    total_votes = sum(c.vote_count for c in candidates)
    result = db.query(Result).filter(Result.election_id == election_id).first()

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5 * inch)
    styles = getSampleStyleSheet()
    story = []

    # Title
    title_style = ParagraphStyle("title", parent=styles["Title"], fontSize=20, textColor=colors.HexColor("#6366f1"))
    story.append(Paragraph("VoteSphere Election Report", title_style))
    story.append(Spacer(1, 0.2 * inch))

    # Election info
    story.append(Paragraph(f"<b>Election:</b> {election.title}", styles["Normal"]))
    story.append(Paragraph(f"<b>Type:</b> {election.type.value.replace('_', ' ').title()}", styles["Normal"]))
    story.append(Paragraph(f"<b>Status:</b> {election.status.value.replace('_', ' ').title()}", styles["Normal"]))
    story.append(Paragraph(f"<b>Period:</b> {election.start_time.strftime('%Y-%m-%d %H:%M')} to {election.end_time.strftime('%Y-%m-%d %H:%M')}", styles["Normal"]))
    story.append(Paragraph(f"<b>Total Votes Cast:</b> {total_votes}", styles["Normal"]))
    story.append(Paragraph(f"<b>Report Generated:</b> {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", styles["Normal"]))
    story.append(Spacer(1, 0.3 * inch))

    # Results table
    story.append(Paragraph("Candidate Results", styles["Heading2"]))
    table_data = [["Candidate", "Party/Position", "Votes", "Percentage"]]
    for c in sorted(candidates, key=lambda x: x.vote_count, reverse=True):
        pct = f"{(c.vote_count / total_votes * 100):.1f}%" if total_votes > 0 else "0%"
        table_data.append([c.name, c.party or c.position or "-", str(c.vote_count), pct])

    table = Table(table_data, colWidths=[2.5 * inch, 2 * inch, 1 * inch, 1 * inch])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#6366f1")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8f9ff")]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ("ALIGN", (2, 0), (-1, -1), "CENTER"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("PADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(table)

    if result and result.winner_id:
        winner = next((c for c in candidates if c.id == result.winner_id), None)
        if winner:
            story.append(Spacer(1, 0.3 * inch))
            win_style = ParagraphStyle("winner", parent=styles["Normal"], fontSize=14,
                                       textColor=colors.HexColor("#10b981"), fontName="Helvetica-Bold")
            story.append(Paragraph(f"Winner: {winner.name}", win_style))

    doc.build(story)
    return buffer.getvalue()
