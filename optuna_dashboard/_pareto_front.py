from __future__ import annotations

from typing import Sequence

from optuna.study._study_direction import StudyDirection
from optuna.trial import FrozenTrial
from optuna.study._multi_objective import _get_pareto_front_trials_by_trials
from optuna.study._constrained_optimization import _CONSTRAINTS_KEY


def get_pareto_front_trials(
    trials: Sequence[FrozenTrial], directions: Sequence[StudyDirection]
) -> list[FrozenTrial]:
    is_constrained = any((_CONSTRAINTS_KEY in trial.system_attrs) for trial in trials)
    return _get_pareto_front_trials_by_trials(trials, directions, is_constrained)
