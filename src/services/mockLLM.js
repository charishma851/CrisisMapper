// Mock service to simulate Claude extracting data and Nominatim resolving coordinates

const DELAY_MS = 1500; // Simulate network latency

export const sampleTweets = `We are stuck on the 2nd floor, water is rising rapidly. My grandmother needs her diabetes medication urgently. We are at 45 Main Street, Velachery, Chennai. Please help! #ChennaiFloods
URGENT: 15 people trapped in the SBI Bank building near the Bus Stand in Vijayawada. Building is shaking. Need immediate evacuation.
Food ran out yesterday. We have 3 infants here. Stranded on roof at Gandhi Nagar 4th street, Ernakulam. Drop supplies if possible.
Water logging near Anna Salai, traffic is completely blocked. Avoid the route.
My neighbor's wall collapsed, two people injured. They are bleeding. Send an ambulance to 12 Park Road, Assam.`;

// Pre-calculated coordinates to simulate successful geocoding for the demo
const MOCK_GEO_DB = {
  'Velachery, Chennai': [12.9782, 80.2206],
  'Vijayawada': [16.5062, 80.6480],
  'Ernakulam': [9.9816, 76.2999],
  'Anna Salai, Chennai': [13.0604, 80.2646],
  'Assam': [26.2006, 92.9376],
};

const MOCK_RESPONSES = [
  {
    id: '1',
    text: "We are stuck on the 2nd floor, water is rising rapidly. My grandmother needs her diabetes medication urgently. We are at 45 Main Street, Velachery, Chennai. Please help! #ChennaiFloods",
    location: "Velachery, Chennai",
    urgency: 5,
    urgencyLabel: "Critical",
    needType: "Medical & Evacuation",
    lat: 12.9782,
    lng: 80.2206,
    confidence: 96,
    peopleImpacted: 1
  },
  {
    id: '2',
    text: "URGENT: 15 people trapped in the SBI Bank building near the Bus Stand in Vijayawada. Building is shaking. Need immediate evacuation.",
    location: "Vijayawada",
    urgency: 5,
    urgencyLabel: "Critical",
    needType: "Trapped Persons",
    lat: 16.5062,
    lng: 80.6480,
    confidence: 94,
    peopleImpacted: 15
  },
  {
    id: '3',
    text: "Food ran out yesterday. We have 3 infants here. Stranded on roof at Gandhi Nagar 4th street, Ernakulam. Drop supplies if possible.",
    location: "Ernakulam",
    urgency: 4,
    urgencyLabel: "Urgent",
    needType: "Food & Water",
    lat: 9.9816,
    lng: 76.2999,
    confidence: 89,
    peopleImpacted: 3
  },
  {
    id: '4',
    text: "Water logging near Anna Salai, traffic is completely blocked. Avoid the route.",
    location: "Anna Salai, Chennai",
    urgency: 2,
    urgencyLabel: "Stable",
    needType: "Infrastructure",
    lat: 13.0604,
    lng: 80.2646,
    confidence: 98,
    peopleImpacted: 0
  },
  {
    id: '5',
    text: "My neighbor's wall collapsed, two people injured. They are bleeding. Send an ambulance to 12 Park Road, Assam.",
    location: "Assam",
    urgency: 5,
    urgencyLabel: "Critical",
    needType: "Medical",
    lat: 26.2006,
    lng: 92.9376,
    confidence: 85,
    peopleImpacted: 2
  }
];

export const processRawText = async (text) => {
  // Simulate API call to Claude
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real app, we would send 'text' to Claude here and parse the JSON.
      // For the demo, we'll split by newline and return the mocked structured data.
      
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      
      // Match lines to mock responses based on fuzzy matching (or just return all if it matches the sample block)
      if (text === sampleTweets) {
        resolve(MOCK_RESPONSES);
      } else {
        // Fallback random mock for unknown text
        const randomUrgencies = [
          { level: 5, label: 'Critical', color: 'red' },
          { level: 4, label: 'Urgent', color: 'yellow' },
          { level: 2, label: 'Stable', color: 'green' }
        ];
        
        const results = lines.map((line, index) => {
          // Simulate scraping if the line is a link
          if (line.trim().startsWith('http://') || line.trim().startsWith('https://')) {
            let hostname = 'link';
            try { hostname = new URL(line.trim()).hostname; } catch(e) {}
            
            return {
              id: Date.now().toString() + index,
              text: `[Scraped from ${hostname}] Urgent rescue needed at MG Road, Bangalore. Water is 4ft high and rising.`,
              location: "MG Road, Bangalore",
              urgency: 4,
              urgencyLabel: "Urgent",
              needType: "Evacuation",
              lat: 12.9716,
              lng: 77.5946,
              confidence: 92,
              peopleImpacted: 5
            };
          }

          const u = randomUrgencies[Math.floor(Math.random() * randomUrgencies.length)];
          // Slightly offset coordinates around center of India for unknown locations
          const lat = 20.5937 + (Math.random() - 0.5) * 5;
          const lng = 78.9629 + (Math.random() - 0.5) * 5;
          
          return {
            id: Date.now().toString() + index,
            text: line,
            location: "Unknown Location",
            urgency: u.level,
            urgencyLabel: u.label,
            needType: "General Rescue",
            lat,
            lng,
            confidence: Math.floor(Math.random() * 20) + 80, // 80 to 99%
            peopleImpacted: Math.floor(Math.random() * 5) + 1
          };
        });
        resolve(results);
      }
    }, DELAY_MS);
  });
};
