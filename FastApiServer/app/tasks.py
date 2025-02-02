"""
Task to process data
"""
from celery import shared_task, Task, states
from celery.exceptions import Ignore
from .Analysis.analysempesa import analysempesa
from .Analysis.converters.mpesaconverter import DecryptionError

@shared_task(bind=True)
def process_data(self: Task , fp, password):
    """Task to process mpesa statement

    :param self: Task instance
    :type self: Task
    :param fp: Filepath
    :type fp: string
    :param password: Password for the pdf
    :type password: string
    :return: Jsson of the result
    :rtype: string
    """
    result = {'data': '', 'error' : ''}
    try:
        data = analysempesa(filepath=fp, password=password)
        result['data'] = data
    except DecryptionError as de:
        print(de)
        self.update_state(
            state = states.FAILURE,
            meta = {
                'exc_type': type(de).__name__,
                'exc_message': 'Wrong password given',
            }
        )
        raise de
    except Exception as ex:
        print(ex)
        result['error'] = 'An unexpected error occurred'

        self.update_state(
            state = states.FAILURE,
            meta = {
                'exc_type': type(ex).__name__,
                'exc_message': str(ex),
            }
        )
        raise ex

    return result
