import unittest
from app.utils.validators import validate_feedback_payload


class TestValidators(unittest.TestCase):
    def test_non_dict_payload(self):
        is_valid, err, cleaned = validate_feedback_payload("string")
        self.assertFalse(is_valid)
        self.assertIn("Expected a JSON object", err)
        self.assertIsNone(cleaned)

    def test_missing_category_fields(self):
        payload = {"food": 5, "service": 4}  # Missing ambience, value, overall
        is_valid, err, cleaned = validate_feedback_payload(payload)
        self.assertFalse(is_valid)
        self.assertIn("Please rate all five categories", err)

    def test_invalid_score_range(self):
        payload = {
            "food": 6,  # > 5
            "service": 4,
            "ambience": 5,
            "value": 4,
            "overall": 5,
        }
        is_valid, err, cleaned = validate_feedback_payload(payload)
        self.assertFalse(is_valid)
        self.assertIn("must be an integer between 1 and 5", err)

        payload["food"] = 0  # < 1
        is_valid, err, cleaned = validate_feedback_payload(payload)
        self.assertFalse(is_valid)
        self.assertIn("must be an integer between 1 and 5", err)

    def test_non_integer_score(self):
        payload = {
            "food": "five",
            "service": 4,
            "ambience": 5,
            "value": 4,
            "overall": 5,
        }
        is_valid, err, cleaned = validate_feedback_payload(payload)
        self.assertFalse(is_valid)
        self.assertIn("must be an integer between 1 and 5", err)

    def test_valid_payload_conversion(self):
        payload = {
            "food": "5",  # string that converts to int
            "service": 4,
            "ambience": 3,
            "value": 4,
            "overall": 5,
            "highlight": "Coffee",
            "comment": "Awesome flat white!",
        }
        is_valid, err, cleaned = validate_feedback_payload(payload)
        self.assertTrue(is_valid)
        self.assertIsNone(err)
        self.assertEqual(cleaned["food"], 5)
        self.assertEqual(cleaned["service"], 4)
        self.assertEqual(cleaned["highlight"], "Coffee")
        self.assertEqual(cleaned["comment"], "Awesome flat white!")

    def test_comment_and_highlight_length_capping(self):
        payload = {
            "food": 5,
            "service": 5,
            "ambience": 5,
            "value": 5,
            "overall": 5,
            "highlight": "H" * 150,
            "comment": "C" * 600,
        }
        is_valid, err, cleaned = validate_feedback_payload(payload)
        self.assertTrue(is_valid)
        self.assertEqual(len(cleaned["highlight"]), 100)
        self.assertEqual(len(cleaned["comment"]), 500)


if __name__ == "__main__":
    unittest.main()
