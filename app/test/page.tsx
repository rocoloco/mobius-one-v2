export default function TestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Server is Working!</h1>
      <p>If you can see this, the Next.js server is running correctly.</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  )
}