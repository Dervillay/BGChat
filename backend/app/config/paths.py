# All paths are relative to the "backend" directory
import os

backend_path = os.path.abspath(os.path.join(__file__, "../../../"))

RULEBOOKS_PATH = os.path.join(backend_path, "resources/rulebooks")
