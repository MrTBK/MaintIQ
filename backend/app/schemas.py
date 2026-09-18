import datetime as dt

from pydantic import BaseModel


class LoginIn(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    role: str
    active: bool


class MachineOut(BaseModel):
    id: str
    name: str
    type: str
    category: str
    location: str
    status: str
    health_score: float
    risk_level: str
    risk_score: float
    operating_hours: float


class Paged(BaseModel):
    items: list
    total: int
    page: int
    page_size: int
