# This is a lightweight dockerfile with python installed on a linux machine
FROM python:3.10-slim


RUN pip install --upgrade pip

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . . 

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]