import os
import time

def delete_old_files(directory: str, age_minutes: int):
    """
    Deletes files in the specified directory that are older than the given age in minutes.

    Args:
        directory (str): The directory to clean up.
        age_minutes (int): The age threshold in minutes.
    """
    current_time = time.time()
    age_seconds = age_minutes * 60
    root_directory = os.getcwd()
    cwd = os.path.join(root_directory, directory)
    print(cwd, 'swws')
    for filename in os.listdir(cwd):
        file_path = os.path.join(cwd, filename)
        # Skip directories
        if not os.path.isfile(file_path):
            continue
        # Check file's last modified time
        file_age = current_time - os.path.getmtime(file_path)
        if file_age > age_seconds:
            try:
                os.remove(file_path)
                print(f"Deleted: {file_path}")
            except Exception as e:
                print(f"Error deleting {file_path}: {e}")

# if __name__ == "__main__":
#     # Directory and age threshold
#     tmp_directory = "app/tmp"
#     age_threshold_minutes = 1

#     delete_old_files(tmp_directory, age_threshold_minutes)