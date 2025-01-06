# myapp/tasks.py
from celery import shared_task, Task, states
from celery.exceptions import Ignore
from .Analysis.analysempesa import analysempesa, DecryptionError

@shared_task(bind=True)
def process_data(self: Task , fp, password):
    result = {'data': '', 'error' : ''}
    try:
        data = analysempesa(filepath=fp, password=password)
        result['data'] = data
    except DecryptionError as de:
        self.update_state(
            state = states.FAILURE,
            meta = {
                'exc_type': type(de).__name__,
                'exc_message': 'Wrong password given',
            }
        )
        raise Ignore()
    except Exception as ex:
        print(ex)
        result['error'] = 'An unexpected error occurred'

        self.update_state(
            state = states.FAILURE,
            meta = {
                'exc_type': type(ex).__name__,
                'exc_message': 'an error occured',
            }
        )
        raise Ignore()

    return result
