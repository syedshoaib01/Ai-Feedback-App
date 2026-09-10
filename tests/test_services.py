import unittest
from app.services.gemini_service import (
    build_review_prompt,
    GeminiService,
    GeminiConfigError,
    GeminiServiceError,
    SCORE_LABELS,
)


class TestGeminiService(unittest.TestCase):
    def test_build_review_prompt_content(self):
        data = {
            "food": 5,
            "service": 3,
            "ambience": 4,
            "value": 4,
            "overall": 5,
            "highlight": "Iced Latte",
            "comment": "Super cozy atmosphere and friendly staff.",
        }
        prompt = build_review_prompt(data)
        self.assertIn("Food & Drinks: Very satisfied / Excellent (5/5)", prompt)
        self.assertIn("Service: Okay / Average (3/5)", prompt)
        self.assertIn("Iced Latte", prompt)
        self.assertIn("Super cozy atmosphere and friendly staff.", prompt)
        self.assertIn("FACTUAL GROUNDING", prompt)
        self.assertIn("SENTIMENT FIDELITY", prompt)

    def test_unconfigured_service_raises_config_error(self):
        service = GeminiService(api_key="")
        self.assertFalse(service.is_configured)
        with self.assertRaises(GeminiConfigError):
            service.generate_review({"food": 5, "service": 5, "ambience": 5, "value": 5, "overall": 5})

    def test_key_redacted_on_error(self):
        service = GeminiService(api_key="SECRET_KEY_12345")
        self.assertTrue(service.is_configured)


if __name__ == "__main__":
    unittest.main()
