from __future__ import annotations

from unittest.mock import Mock
from uuid import uuid4

from infrastructure.database.models.shadow_evaluation import (
    ShadowEvaluation,
)
from infrastructure.database.repositories.shadow_repository import (
    ShadowRepository,
)


def make_shadow():

    return ShadowEvaluation(
        flag_id=uuid4(),
        user_id="user-1",
        baseline_response="baseline",
        experimental_response="experiment",
        judge_score=4.5,
        latency_ms=200,
        has_error=False,
        error_message=None,
    )


def test_save():

    session = Mock()

    repository = ShadowRepository(session)

    evaluation = make_shadow()

    repository.save(evaluation)

    session.add.assert_called_once_with(evaluation)
    session.commit.assert_called_once()
    session.refresh.assert_called_once_with(evaluation)


def test_get():

    session = Mock()

    repository = ShadowRepository(session)

    evaluation = make_shadow()

    session.get.return_value = evaluation

    result = repository.get(evaluation.id)

    assert result == evaluation


def test_delete():

    session = Mock()

    repository = ShadowRepository(session)

    evaluation = make_shadow()

    repository.delete(evaluation)

    session.delete.assert_called_once_with(evaluation)
    session.commit.assert_called_once()


def test_latest_returns_list():

    session = Mock()

    repository = ShadowRepository(session)

    evaluation = make_shadow()

    session.scalars.return_value = [evaluation]

    result = repository.latest(
        flag_id=evaluation.flag_id,
    )

    assert len(result) == 1


def test_by_user_returns_list():

    session = Mock()

    repository = ShadowRepository(session)

    evaluation = make_shadow()

    session.scalars.return_value = [evaluation]

    result = repository.by_user(
        flag_id=evaluation.flag_id,
        user_id=evaluation.user_id,
    )

    assert len(result) == 1