import { NextResponse } from 'next/server';

export async function GET() {
  const url =
    'https://jsearch.p.rapidapi.com/search?query=Node.js%20developer%20in%20New-York%2CUSA&page=1&num_pages=1&date_posted=all';
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': '3e24262a3emshca23339509974e3p167c95jsnbe9b950dac91',
      'x-rapidapi-host': 'jsearch.p.rapidapi.com',
    },
  };

  try {
    const response = await fetch(url, options);
    const responseData = await response.json();

    const result = responseData.data;
    const totalItems = result.length;
    
    return NextResponse.json({ result, totalItems });
  } catch (error) {
    console.log(error);
    throw error;
  }
}
