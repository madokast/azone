export function selectFile(accept?: string): Promise<File> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.style.display = 'none';
    input.multiple = false;
    if (accept) input.accept = accept;

    const cleanUp = () => {
      input.removeEventListener('change', handleChange);
      if (input.parentNode) document.body.removeChild(input);
    };

    const handleChange = () => {
      const file = input.files?.[0];
      cleanUp();
      if (file) resolve(file);
      else reject(new Error('未选择任何文件'));
    };

    input.addEventListener('change', handleChange);
    document.body.appendChild(input);
    input.click();
  });
}

export function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
  });
}
