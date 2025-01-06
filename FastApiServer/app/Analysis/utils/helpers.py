import uuid

def generate_uuid(text, length=8):
    'generates a uuid string'
    text = str(text)
    unique_id = uuid.uuid5(uuid.NAMESPACE_DNS, text)
    return str(unique_id).replace("-", "")[:length]


def reorder(arr: list, after: int|str =None, before: int|str =None, to_move: list|str = None):
    '''
    Reorders a list 
    '''
    ### TODO the after function is not working well
    assert not (after and before)
    print(to_move)
    if after:
        if isinstance(after, str):
            ind = arr.index(after) + 1
        elif isinstance(after, int):
            ind = after + 1
        if isinstance(to_move, str):
            to_move = [to_move]
        new_order = (
            [col for col in arr[:ind] if col not in to_move] +
            list(to_move) +
            [col for col in arr[ind:] if col not in to_move]
        )
        return new_order
    elif before:
        if isinstance(before, str):
            ind = arr.index(before) - 1
        else:

            ind = before - 1
        print(3232)
        if isinstance(to_move, str):
            to_move = [to_move]
        new_order = (
            [col for col in arr[:ind] if col not in to_move] +
            list(to_move) +
            [col for col in arr[ind:] if col not in to_move]
        )
        return new_order
    
