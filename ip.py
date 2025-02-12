import subprocess
import os


def get_ip_address(interface='en0'):
    result = subprocess.run(
        ['ifconfig', interface],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    output = result.stdout
    lines = [line for line in output.split('\n') if 'inet ' in line]
    if lines:
        ip_address = lines[0].split()[1]
        return ip_address
    return None


def update_shell_config(ip_address, file_path='~/.zshrc'):
    file_path = os.path.expanduser(file_path)
    lines = []
    updated = False

    with open(file_path, 'r') as file:
        lines = file.readlines()

    with open(file_path, 'w') as file:
        for line in lines:
            if line.startswith('export REACT_APP_DOMAIN='):
                file.write(f"export REACT_APP_DOMAIN=\"http://{ip_address}\"\n")
                updated = True
            else:
                file.write(line)
        if not updated:
            file.write(f"export REACT_APP_DOMAIN=\"http://{ip_address}\"\n")


if __name__ == "__main__":
    ip_address = get_ip_address()
    if ip_address:
        update_shell_config(ip_address)