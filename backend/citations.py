from schemas import DocumentAnalysis


def validate_and_clamp_citations(analysis: DocumentAnalysis, max_page: int) -> DocumentAnalysis:
    """
    Defends against the LLM occasionally hallucinating a page number outside
    the real bounds of the document (e.g., citing "page 47" in a document
    that only has 12 pages). Clamps any out-of-range page_number to the
    nearest valid page, rather than silently trusting whatever the LLM
    returned.

    This is a safety net, not a perfect fix - it corrects impossible page
    numbers, but doesn't verify the cited page is the *exact* right one.
    That level of guarantee would require re-checking each claim against
    the actual page content, which is a heavier feature for later.
    """

    def clamp(page_number: int) -> int:
        if page_number < 1:
            return 1
        if page_number > max_page:
            return max_page
        return page_number

    for risk in analysis.risks:
        risk.page_number = clamp(risk.page_number)

    for clause in analysis.key_clauses:
        clause.page_number = clamp(clause.page_number)

    for date_item in analysis.key_dates:
        date_item.page_number = clamp(date_item.page_number)

    for payment in analysis.payment_terms:
        payment.page_number = clamp(payment.page_number)

    for obligation in analysis.obligations:
        obligation.page_number = clamp(obligation.page_number)

    return analysis