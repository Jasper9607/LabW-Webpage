import os
import sys
import time


def delDir(directory, t=3600 * 24 * 7):
    files = os.listdir(directory)
    for file in files:
        filePath = directory + "/" + file
        if os.path.isfile(filePath):
            last = int(os.stat(filePath).st_mtime)
            now = int(time.time())
            if now - last >= t:
                os.remove(filePath)
        elif os.path.isdir(filePath):
            delDir(filePath, t)
            if not os.listdir(filePath):
                os.rmdir(filePath)


if __name__ == '__main__':
    while True:
        delDir('./database')
        delDir('./static/file')
        time.sleep(3600 * 24 * 7)
