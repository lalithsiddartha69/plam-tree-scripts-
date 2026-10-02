import datetime
from sqlalchemy.orm import Session
from backend.models import Alert

class AlertService:
    @staticmethod
    def process_risk_and_alert(risk_data: dict, db: Session) -> Alert | None:
        """
        Deduplicates alerts: creates a new alert only on severity transition
        or after a reasonable interval (15 mins) for persistent unacknowledged warnings.
        """
        level = risk_data.get("risk_level")
        if level not in ["WARNING", "CRITICAL"]:
            return None

        reason = risk_data.get("reason", "")
        main_factor = risk_data.get("main_factor", "none")
        now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)

        # Check latest alert for same level/factor in database
        recent_alert = (
            db.query(Alert)
            .filter(Alert.risk_level == level, Alert.main_factor == main_factor)
            .order_by(Alert.timestamp.desc())
            .first()
        )

        if recent_alert:
            time_diff = (now - recent_alert.timestamp).total_seconds()
            # If an identical active alert exists within the last 15 minutes, deduplicate
            if time_diff < 900 and not recent_alert.acknowledged:
                return None

        # Create new deduplicated alert
        new_alert = Alert(
            timestamp=now,
            risk_level=level,
            reason=reason,
            main_factor=main_factor,
            acknowledged=False,
        )
        db.add(new_alert)
        db.commit()
        db.refresh(new_alert)
        return new_alert

    @staticmethod
    def acknowledge_alert(alert_id: int, db: Session) -> Alert | None:
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        if alert:
            alert.acknowledged = True
            db.commit()
            db.refresh(alert)
        return alert

alert_service = AlertService()
