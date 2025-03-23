
document.getElementById('futureForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the form from refreshing the page
  
    // Get user answers
    const q1 = document.getElementById('q1').value;
    const q2 = document.getElementById('q2').value;
    const q3 = document.getElementById('q3').value;
  
    // Combine answers into a single prompt
    const prompt = `Based on these answers, predict the future: Favorite color: ${q1}, Spirit animal: ${q2}, Dream destination: ${q3}`;
  
    // Call DeepSeek API
    try {
      const response = await fetch('https://corsproxy.io/https://api.deepseek.com/v1/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `sk-be681***********************7189` // Replace with your API key
        },
        body: JSON.stringify({
          prompt: prompt,
          max_tokens: 100 // Adjust as needed
        })
      });
  
      const data = await response.json();
      const resultText = data.choices[0].text; // Adjust based on DeepSeek's response format
  
      // Display the result
      document.getElementById('result').innerText = resultText;
    } catch (error) {
      console.error('Error calling DeepSeek API:', error);
      document.getElementById('result').innerText = "Sorry, something went wrong. Please try again.";
    }
  });