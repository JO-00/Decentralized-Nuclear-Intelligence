export async function HandleForm(data: FormData) {
  const file = data.get('file');
  if (!(file instanceof File)) return;

  const content = await file.text();
  console.log(content);
}
