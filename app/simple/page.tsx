export default function SimplePage() {
  return (
    <html>
      <body>
        <h1>Simple Test Page</h1>
        <p>Server is running on port 3000</p>
        <p>Time: {new Date().toString()}</p>
      </body>
    </html>
  )
}