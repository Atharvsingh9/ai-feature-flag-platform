from core.quality.judge import (
    JudgeResult,
    MockJudge,
)


def test_empty_response():
    judge = MockJudge()

    result = judge.evaluate(
        prompt="Hello",
        response="",
    )

    assert isinstance(result, JudgeResult)
    assert result.score == 1.0
    assert result.reasoning == "Empty response."


def test_short_response():
    judge = MockJudge()

    result = judge.evaluate(
        prompt="Hello",
        response="Too short",
    )

    assert result.score == 2.0
    assert result.reasoning == "Response is too short."


def test_unknown_response():
    judge = MockJudge()

    result = judge.evaluate(
        prompt="Question",
        response="I don't know",
    )

    assert result.score == 2.5
    assert result.reasoning == "Response lacks confidence."


def test_detailed_response():
    judge = MockJudge()

    response = "A" * 300

    result = judge.evaluate(
        prompt="Explain",
        response=response,
    )

    assert result.score == 4.8
    assert result.reasoning == "Detailed response."


def test_good_response():
    judge = MockJudge()

    response = (
        "This response contains enough information "
        "to be considered a good overall answer."
    )

    result = judge.evaluate(
        prompt="Explain",
        response=response,
    )

    assert result.score == 4.3
    assert result.reasoning == "Good overall response."


def test_whitespace_response_is_empty():
    judge = MockJudge()

    result = judge.evaluate(
        prompt="Hello",
        response="      ",
    )

    assert result.score == 1.0
    assert result.reasoning == "Empty response."