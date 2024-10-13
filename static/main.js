document
  .getElementById("search-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    let query = document.getElementById("query").value;
    let resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    fetch("/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        query: query,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        displayResults(data);
        displayChart(data);
      });
  });

function displayResults(data) {
  let resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "<h2>Results</h2>";
  for (let i = 0; i < data.documents.length; i++) {
    let docDiv = document.createElement("div");
    docDiv.innerHTML = `<strong>Document ${data.indices[i]}</strong><p>${data.documents[i]}</p><br><strong>Similarity: ${data.similarities[i]}</strong>`;
    resultsDiv.appendChild(docDiv);
  }
}

function displayChart(data) {
  // Input: data (object) - contains the following keys:
  //        - documents (list) - list of documents
  //        - indices (list) - list of indices
  //        - similarities (list) - list of similarities
  // TODO: Implement function to display chart here
  //       There is a canvas element in the HTML file with the id 'similarity-chart'
  let canvas = document.getElementById("similarity-chart");
  canvas.width = 500;
  canvas.height = 500;
  let ctx = canvas.getContext("2d");
  // Set up chart dimensions and padding

  const chartWidth = canvas.width;
  const chartHeight = canvas.height;
  const padding = 50;

  // Extract data from the input object
  const { similarities, indices } = data;

  // Calculate the maximum similarity for scaling
  const maxSimilarity = Math.max(...similarities);

  // Calculate the width of each bar
  const barWidth = (chartWidth - 2 * padding) / similarities.length;

  // Clear the canvas
  ctx.clearRect(0, 0, chartWidth, chartHeight);

  // Draw X and Y axes
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, chartHeight - padding);
  ctx.lineTo(chartWidth - padding, chartHeight - padding);
  ctx.stroke();

  // Draw the bars
  for (let i = 0; i < similarities.length; i++) {
    const barHeight =
      (similarities[i] / maxSimilarity) * (chartHeight - 2 * padding);
    const x = padding + i * barWidth;
    const y = chartHeight - padding - barHeight;

    ctx.fillStyle = "skyblue";
    ctx.fillRect(x, y, barWidth - 5, barHeight);

    // Add document index labels on the X-axis
    ctx.fillStyle = "black";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      indices[i],
      x + (barWidth - 5) / 2,
      chartHeight - padding + 15
    );
  }

  // Add Y-axis labels
  ctx.fillStyle = "black";
  ctx.font = "12px Arial";
  ctx.textAlign = "right";
  ctx.fillText("0", padding - 10, chartHeight - padding);
  ctx.fillText(maxSimilarity.toFixed(2), padding - 10, padding + 5);

  // Add chart title
  ctx.font = "16px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Similarity Chart", chartWidth / 2, padding / 2);
}
