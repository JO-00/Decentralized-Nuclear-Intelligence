export function HandleForm(formdata: FormData) {
  // for now we're not gonna handle it at all for the MVP
  const file = formdata.get('file');
  if (file instanceof File) {
    console.log(file.name);
  }
}
