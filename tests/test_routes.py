import unittest
from unittest.mock import patch
from app import create_app


class TestRoutes(unittest.TestCase):
    def setUp(self):
        self.app = create_app("testing")
        self.client = self.app.test_client()

    def test_index_route(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"ReviewFlow", response.data)
        self.assertIn(b"How was your visit?", response.data)

    def test_health_route(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["status"], "healthy")
        self.assertTrue(data["gemini_configured"])

    def test_api_generate_missing_payload(self):
        response = self.client.post("/api/generate", json={})
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertIn("error", data)

    def test_api_generate_invalid_rating(self):
        payload = {
            "food": 99,  # invalid rating
            "service": 5,
            "ambience": 5,
            "value": 5,
            "overall": 5,
        }
        response = self.client.post("/api/generate", json=payload)
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertIn("must be an integer between 1 and 5", data["error"])

    def test_api_generate_unconfigured_api_key(self):
        # Temporarily clear key
        self.app.config["GEMINI_API_KEY"] = ""
        payload = {
            "food": 5,
            "service": 5,
            "ambience": 5,
            "value": 5,
            "overall": 5,
        }
        response = self.client.post("/api/generate", json=payload)
        self.assertEqual(response.status_code, 503)
        data = response.get_json()
        self.assertIn("GEMINI_API_KEY is not configured", data["error"])

    @patch("app.routes.api.GeminiService.generate_review")
    def test_api_generate_success(self, mock_generate):
        mock_generate.return_value = "Honestly loved the coffee here, vibes were immaculate!"
        payload = {
            "food": 5,
            "service": 4,
            "ambience": 5,
            "value": 4,
            "overall": 5,
            "highlight": "Coffee",
            "comment": "Best oat latte in town.",
        }
        response = self.client.post("/api/generate", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["review"], "Honestly loved the coffee here, vibes were immaculate!")
        self.assertEqual(data["source"], "Gemini")
        self.assertEqual(data["google_review_url"], "https://maps.google.com/test-review-link")


if __name__ == "__main__":
    unittest.main()
