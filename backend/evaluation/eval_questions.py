EVAL_QUESTIONS = [
    {
        "question": "What is the monthly base rent?",
        "expected_answer_contains": ["185,000", "185000"],
        "expected_page": 1,
        "category": "on_topic_direct",
    },
    {
        "question": "When does the lease term end?",
        "expected_answer_contains": ["31", "January", "2029"],
        "expected_page": 1,
        "category": "on_topic_direct",
    },
    {
        "question": "How much is the security deposit?",
        "expected_answer_contains": ["555,000", "555000"],
        "expected_page": 2,
        "category": "on_topic_direct",
    },
    {
        "question": "What happens if the tenant terminates the lease early, before 12 months?",
        "expected_answer_contains": ["two", "2 months", "early-termination fee", "early termination fee"],
        "expected_page": 2,
        "category": "on_topic_direct",
    },
    {
        "question": "How many days' notice is required for the annual renewal option?",
        "expected_answer_contains": ["90", "ninety"],
        "expected_page": 1,
        "category": "on_topic_direct",
    },
    {
        "question": "What is the capital of France?",
        "expected_answer_contains": [],
        "expected_page": None,
        "category": "off_topic",
    },
    {
        "question": "What is the tenant's favorite color?",
        "expected_answer_contains": [],
        "expected_page": None,
        "category": "off_topic",
    },
    {
        "question": "What is the penalty if the tenant terminates after the first 12 months but the lease doesn't specify a fee for that scenario?",
        "expected_answer_contains": [],
        "expected_page": None,
        "category": "borderline_should_not_guess",
    },
]