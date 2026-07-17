from sqlalchemy.orm import Session

from infrastructure.database.models.rollout_event import RolloutEvent


class RolloutEventRepository:
    def __init__(self, session: Session):
        self.session = session

    def create(self, event: RolloutEvent) -> RolloutEvent:
        self.session.add(event)
        self.session.commit()
        self.session.refresh(event)
        return event

    def get_by_flag_id(self, flag_id: int) -> list[RolloutEvent]:
        return (
            self.session.query(RolloutEvent)
            .filter(RolloutEvent.flag_id == flag_id)
            .order_by(RolloutEvent.created_at.asc())
            .all()
        )

    def delete_all_for_flag(self, flag_id: int) -> None:
        (
            self.session.query(RolloutEvent)
            .filter(RolloutEvent.flag_id == flag_id)
            .delete()
        )
        self.session.commit()