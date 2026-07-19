from core.quality.sampling import (
    RolloutAwareSamplingPolicy,
    SamplingContext,
)


def test_small_rollout_always_evaluates():
    """
    Rollouts <= 5% should always be evaluated,
    regardless of sampling percentage.
    """

    policy = RolloutAwareSamplingPolicy()

    context = SamplingContext(
        user_id="user-123",
        rollout_percentage=5,
        sampling_percentage=0,
    )

    assert policy.should_evaluate(context) is True


def test_zero_sampling_never_evaluates():
    """
    If rollout is greater than 5% and sampling is 0%,
    no requests should be evaluated.
    """

    policy = RolloutAwareSamplingPolicy()

    context = SamplingContext(
        user_id="user-123",
        rollout_percentage=50,
        sampling_percentage=0,
    )

    assert policy.should_evaluate(context) is False


def test_full_sampling_always_evaluates():
    """
    Sampling at 100% should always evaluate.
    """

    policy = RolloutAwareSamplingPolicy()

    context = SamplingContext(
        user_id="user-123",
        rollout_percentage=50,
        sampling_percentage=100,
    )

    assert policy.should_evaluate(context) is True


def test_sampling_is_deterministic():
    """
    The same user should always receive
    the same sampling decision.
    """

    policy = RolloutAwareSamplingPolicy()

    context = SamplingContext(
        user_id="consistent-user",
        rollout_percentage=50,
        sampling_percentage=30,
    )

    first = policy.should_evaluate(context)
    second = policy.should_evaluate(context)
    third = policy.should_evaluate(context)

    assert first == second
    assert second == third


def test_different_users_produce_consistent_results():
    """
    Ensure hashing works consistently across users.
    """

    policy = RolloutAwareSamplingPolicy()

    users = [
        "alice",
        "bob",
        "charlie",
        "david",
        "eve",
        "frank",
        "grace",
        "henry",
    ]

    first_run = []

    for user in users:
        context = SamplingContext(
            user_id=user,
            rollout_percentage=50,
            sampling_percentage=25,
        )

        first_run.append(policy.should_evaluate(context))

    second_run = []

    for user in users:
        context = SamplingContext(
            user_id=user,
            rollout_percentage=50,
            sampling_percentage=25,
        )

        second_run.append(policy.should_evaluate(context))

    assert first_run == second_run


def test_bucket_boundaries():
    """
    Boundary conditions for sampling percentages.
    """

    policy = RolloutAwareSamplingPolicy()

    context_zero = SamplingContext(
        user_id="boundary-user",
        rollout_percentage=50,
        sampling_percentage=0,
    )

    context_full = SamplingContext(
        user_id="boundary-user",
        rollout_percentage=50,
        sampling_percentage=100,
    )

    assert policy.should_evaluate(context_zero) is False
    assert policy.should_evaluate(context_full) is True


def test_sampling_returns_boolean():
    """
    The policy should always return a boolean.
    """

    policy = RolloutAwareSamplingPolicy()

    context = SamplingContext(
        user_id="random-user",
        rollout_percentage=80,
        sampling_percentage=42,
    )

    result = policy.should_evaluate(context)

    assert isinstance(result, bool)