from functools import wraps
from flask import current_app, g
import threading
import logging
from datetime import datetime

# Singleton Pattern
class Singleton(type):
    """
    Singleton tasarım deseni için metaclass.
    Bir sınıfın yalnızca bir örneğinin oluşturulmasını sağlar.
    """
    _instances = {}
    _lock = threading.Lock()

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            with cls._lock:
                if cls not in cls._instances:
                    cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]

# Observer Pattern
class Subject:
    """
    Observer tasarım deseninin Subject sınıfı.
    Olayları dinleyicilere bildirir.
    """
    def __init__(self):
        self._observers = []
        self._state = None

    def attach(self, observer):
        if observer not in self._observers:
            self._observers.append(observer)

    def detach(self, observer):
        self._observers.remove(observer)

    def notify(self, *args, **kwargs):
        for observer in self._observers:
            observer.update(*args, **kwargs)

# Factory Pattern
class LoggerFactory:
    """
    Factory tasarım deseni için logger oluşturucu.
    Farklı türde logger'lar oluşturur.
    """
    @staticmethod
    def create_logger(logger_type="file"):
        logger = logging.getLogger(f"firat_store_{logger_type}")
        logger.setLevel(logging.INFO)

        if logger_type == "file":
            handler = logging.FileHandler("firat_store.log")
        else:
            handler = logging.StreamHandler()

        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        return logger

# Strategy Pattern
class PriceStrategy:
    """
    Strategy tasarım deseni için fiyat stratejisi.
    Farklı fiyatlandırma stratejilerini uygular.
    """
    def calculate(self, base_price, user):
        raise NotImplementedError

class StudentPriceStrategy(PriceStrategy):
    def calculate(self, base_price, user):
        if not user.not_ortalamasi:
            return base_price

        if user.not_ortalamasi >= 3.5:
            discount = 0.10
        elif user.not_ortalamasi >= 3.0:
            discount = 0.07
        elif user.not_ortalamasi >= 2.5:
            discount = 0.05
        else:
            discount = 0

        return base_price * (1 - discount)

class RegularPriceStrategy(PriceStrategy):
    def calculate(self, base_price, user):
        return base_price

# Decorator Pattern
def cache_result(timeout=300):
    """
    Decorator tasarım deseni örneği.
    Fonksiyon sonuçlarını belirli bir süre cache'ler.
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            cache_key = f"{f.__name__}:{str(args)}:{str(kwargs)}"
            
            if hasattr(g, '_cache'):
                cache = g._cache
            else:
                cache = g._cache = {}

            now = datetime.now().timestamp()
            if cache_key in cache:
                result, timestamp = cache[cache_key]
                if now - timestamp < timeout:
                    return result

            result = f(*args, **kwargs)
            cache[cache_key] = (result, now)
            return result
        return decorated_function
    return decorator

# Repository Pattern
class Repository:
    """
    Repository tasarım deseni.
    Veritabanı işlemlerini soyutlar.
    """
    def __init__(self, model):
        self.model = model

    def get(self, id):
        return self.model.query.get(id)

    def get_all(self):
        return self.model.query.all()

    def find(self, **kwargs):
        return self.model.query.filter_by(**kwargs).all()

    def create(self, **kwargs):
        instance = self.model(**kwargs)
        current_app.db.session.add(instance)
        current_app.db.session.commit()
        return instance

    def update(self, instance, **kwargs):
        for key, value in kwargs.items():
            setattr(instance, key, value)
        current_app.db.session.commit()
        return instance

    def delete(self, instance):
        current_app.db.session.delete(instance)
        current_app.db.session.commit()

# Unit of Work Pattern
class UnitOfWork:
    """
    Unit of Work tasarım deseni.
    Veritabanı işlemlerini toplu olarak yönetir.
    """
    def __init__(self):
        self.db = current_app.db.session
        self._operations = []

    def register_operation(self, operation):
        self._operations.append(operation)

    def commit(self):
        try:
            for operation in self._operations:
                operation()
            self.db.commit()
            self._operations.clear()
        except Exception as e:
            self.db.rollback()
            self._operations.clear()
            raise e

    def rollback(self):
        self.db.rollback()
        self._operations.clear()

# Service Locator Pattern
class ServiceLocator:
    """
    Service Locator tasarım deseni.
    Servisleri merkezi olarak yönetir.
    """
    _services = {}

    @classmethod
    def register_service(cls, name, service):
        cls._services[name] = service

    @classmethod
    def get_service(cls, name):
        return cls._services.get(name)

# Event Bus Pattern
class EventBus:
    """
    Event Bus tasarım deseni.
    Olayları merkezi olarak yönetir.
    """
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if not cls._instance:
            with cls._lock:
                if not cls._instance:
                    cls._instance = super().__new__(cls)
                    cls._instance.handlers = {}
        return cls._instance

    def subscribe(self, event_type, handler):
        if event_type not in self.handlers:
            self.handlers[event_type] = []
        self.handlers[event_type].append(handler)

    def unsubscribe(self, event_type, handler):
        if event_type in self.handlers:
            self.handlers[event_type].remove(handler)

    def publish(self, event_type, data):
        if event_type in self.handlers:
            for handler in self.handlers[event_type]:
                handler(data)

# Value Object Pattern
class Money:
    """
    Value Object tasarım deseni örneği.
    Para değerlerini temsil eder.
    """
    def __init__(self, amount, currency="TRY"):
        self.amount = amount
        self.currency = currency

    def __eq__(self, other):
        if not isinstance(other, Money):
            return False
        return self.amount == other.amount and self.currency == other.currency

    def __add__(self, other):
        if self.currency != other.currency:
            raise ValueError("Cannot add different currencies")
        return Money(self.amount + other.amount, self.currency)

    def __sub__(self, other):
        if self.currency != other.currency:
            raise ValueError("Cannot subtract different currencies")
        return Money(self.amount - other.amount, self.currency)

    def __str__(self):
        return f"{self.amount:.2f} {self.currency}"

# Specification Pattern
class Specification:
    """
    Specification tasarım deseni.
    Karmaşık sorguları soyutlar.
    """
    def is_satisfied_by(self, candidate):
        raise NotImplementedError

    def __and__(self, other):
        return AndSpecification(self, other)

    def __or__(self, other):
        return OrSpecification(self, other)

class AndSpecification(Specification):
    def __init__(self, *specifications):
        self.specifications = specifications

    def is_satisfied_by(self, candidate):
        return all(spec.is_satisfied_by(candidate) for spec in self.specifications)

class OrSpecification(Specification):
    def __init__(self, *specifications):
        self.specifications = specifications

    def is_satisfied_by(self, candidate):
        return any(spec.is_satisfied_by(candidate) for spec in self.specifications)
