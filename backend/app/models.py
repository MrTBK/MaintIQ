import datetime as dt

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(128))
    role: Mapped[str] = mapped_column(String(32), default="VIEWER")
    display_name: Mapped[str] = mapped_column(String(128), default="")
    email: Mapped[str] = mapped_column(String(128), default="")
    active: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, default=dt.datetime.utcnow)


class Session(Base):
    __tablename__ = "sessions"
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, default=dt.datetime.utcnow)
    expires_at: Mapped[dt.datetime] = mapped_column(DateTime)


class Machine(Base):
    __tablename__ = "machines"
    id: Mapped[str] = mapped_column(String(16), primary_key=True)
    name: Mapped[str] = mapped_column(String(128))
    type: Mapped[str] = mapped_column(String(64))
    category: Mapped[str] = mapped_column(String(32))
    location: Mapped[str] = mapped_column(String(64))
    manufacturer: Mapped[str] = mapped_column(String(128), default="")
    criticality: Mapped[str] = mapped_column(String(32), default="B (Medium Impact)")
    operating_hours: Mapped[float] = mapped_column(Float, default=0)
    status: Mapped[str] = mapped_column(String(16), default="Healthy")
    health_score: Mapped[float] = mapped_column(Float, default=100)
    risk_level: Mapped[str] = mapped_column(String(16), default="Low")
    risk_score: Mapped[float] = mapped_column(Float, default=0)


class SensorReading(Base):
    __tablename__ = "sensor_readings"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    machine_id: Mapped[str] = mapped_column(ForeignKey("machines.id"), index=True)
    ts: Mapped[dt.datetime] = mapped_column(DateTime, index=True)
    temperature: Mapped[float] = mapped_column(Float)
    vibration: Mapped[float] = mapped_column(Float)
    pressure: Mapped[float] = mapped_column(Float)
    rpm: Mapped[float] = mapped_column(Float)
    current: Mapped[float] = mapped_column(Float)


class Failure(Base):
    __tablename__ = "failures"
    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    machine_id: Mapped[str] = mapped_column(ForeignKey("machines.id"), index=True)
    failure_type: Mapped[str] = mapped_column(String(64))
    detected_at: Mapped[dt.datetime] = mapped_column(DateTime)
    downtime_hours: Mapped[float] = mapped_column(Float, default=0)
    action: Mapped[str] = mapped_column(Text, default="")
    technician: Mapped[str] = mapped_column(String(128), default="")
    status: Mapped[str] = mapped_column(String(32), default="Closed")


class MaintenanceTask(Base):
    __tablename__ = "maintenance_tasks"
    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    machine_id: Mapped[str] = mapped_column(ForeignKey("machines.id"), index=True)
    type: Mapped[str] = mapped_column(String(64))
    priority: Mapped[str] = mapped_column(String(16))
    due_date: Mapped[dt.datetime] = mapped_column(DateTime)
    assigned_to: Mapped[str] = mapped_column(String(128), default="")
    est_downtime: Mapped[str] = mapped_column(String(32), default="")
    status: Mapped[str] = mapped_column(String(16), default="Upcoming")
    description: Mapped[str] = mapped_column(Text, default="")


class Risk(Base):
    __tablename__ = "risks"
    machine_id: Mapped[str] = mapped_column(ForeignKey("machines.id"), primary_key=True)
    risk_score: Mapped[float] = mapped_column(Float)
    risk_level: Mapped[str] = mapped_column(String(16))
    primary_driver: Mapped[str] = mapped_column(String(128))
    evidence: Mapped[str] = mapped_column(Text, default="[]")
    updated_at: Mapped[dt.datetime] = mapped_column(DateTime, default=dt.datetime.utcnow)


class Recommendation(Base):
    __tablename__ = "recommendations"
    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    machine_id: Mapped[str] = mapped_column(ForeignKey("machines.id"), index=True)
    priority: Mapped[str] = mapped_column(String(16))
    recommendation: Mapped[str] = mapped_column(Text)
    reason: Mapped[str] = mapped_column(Text, default="")
    impact: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(16), default="Pending")
    window: Mapped[str] = mapped_column(String(64), default="")
    downtime: Mapped[str] = mapped_column(String(32), default="")
    generated_at: Mapped[dt.datetime] = mapped_column(DateTime, default=dt.datetime.utcnow)


class Alert(Base):
    __tablename__ = "alerts"
    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    severity: Mapped[str] = mapped_column(String(16))
    machine_id: Mapped[str] = mapped_column(ForeignKey("machines.id"), index=True)
    event: Mapped[str] = mapped_column(Text)
    timestamp: Mapped[dt.datetime] = mapped_column(DateTime, default=dt.datetime.utcnow)
    status: Mapped[str] = mapped_column(String(16), default="Detected")
    metric: Mapped[str] = mapped_column(String(64), default="")
    details: Mapped[str] = mapped_column(Text, default="")


class DataSource(Base):
    __tablename__ = "data_sources"
    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    name: Mapped[str] = mapped_column(String(128))
    type: Mapped[str] = mapped_column(String(64))
    status: Mapped[str] = mapped_column(String(32), default="Not configured")
    last_ingestion: Mapped[str] = mapped_column(String(64), default="")
    rows: Mapped[int] = mapped_column(Integer, default=0)
    coverage: Mapped[str] = mapped_column(String(64), default="")
    quality: Mapped[float] = mapped_column(Float, default=0)


class Anomaly(Base):
    __tablename__ = "anomalies"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    machine_id: Mapped[str] = mapped_column(ForeignKey("machines.id"), index=True)
    sensor: Mapped[str] = mapped_column(String(32))
    ts: Mapped[dt.datetime] = mapped_column(DateTime, index=True)
    observed: Mapped[float] = mapped_column(Float)
    baseline: Mapped[float] = mapped_column(Float)
    deviation: Mapped[float] = mapped_column(Float)  # z-score
    severity: Mapped[str] = mapped_column(String(16))
    method: Mapped[str] = mapped_column(String(32), default="rolling-z")
    run_id: Mapped[str] = mapped_column(String(32), default="")


class Setting(Base):
    __tablename__ = "settings"
    key: Mapped[str] = mapped_column(String(64), primary_key=True)
    value: Mapped[str] = mapped_column(Text, default="{}")
    updated_at: Mapped[dt.datetime] = mapped_column(DateTime, default=dt.datetime.utcnow)


class DQReport(Base):
    __tablename__ = "dq_reports"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    dataset: Mapped[str] = mapped_column(String(128))
    records: Mapped[int] = mapped_column(Integer)
    completeness: Mapped[float] = mapped_column(Float)
    validity: Mapped[float] = mapped_column(Float)
    consistency: Mapped[float] = mapped_column(Float)
    duplicates: Mapped[int] = mapped_column(Integer, default=0)
    outliers: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, default=dt.datetime.utcnow)


class Run(Base):
    __tablename__ = "runs"
    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    started: Mapped[dt.datetime] = mapped_column(DateTime, default=dt.datetime.utcnow)
    completed: Mapped[dt.datetime] = mapped_column(DateTime, nullable=True)
    dataset: Mapped[str] = mapped_column(String(128), default="")
    rows: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(16), default="Running")
    duration: Mapped[str] = mapped_column(String(32), default="")
    trigger: Mapped[str] = mapped_column(String(32), default="Manual")
    findings: Mapped[str] = mapped_column(Text, default="")
    log: Mapped[str] = mapped_column(Text, default="{}")


class AuditEvent(Base):
    __tablename__ = "audit_events"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ts: Mapped[dt.datetime] = mapped_column(DateTime, default=dt.datetime.utcnow)
    user: Mapped[str] = mapped_column(String(64))
    role: Mapped[str] = mapped_column(String(32))
    action: Mapped[str] = mapped_column(String(128))
    resource: Mapped[str] = mapped_column(String(128))
    result: Mapped[str] = mapped_column(String(16))
    details: Mapped[str] = mapped_column(Text, default="")
