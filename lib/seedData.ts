import { MediaAnalysis } from './types';

// Pre-populated analyses for popular titles
// Key format: "title_lowercase|level"
export const seedData: Record<string, MediaAnalysis> = {
  // The Little Mermaid (2023) - Conservative perspective
  "the little mermaid|8": {
    title: "The Little Mermaid",
    type: "movie",
    year: "2023",
    perspectiveLevel: 8,
    perspectiveLabel: "Traditional",
    summary: "Disney's live-action remake of the 1989 classic featuring Halle Bailey as Ariel. The casting choice sparked significant controversy among traditional audiences who felt it deviated from the established character design.",
    rating: 4,
    ratingExplanation: "Race-swapped lead character and modernized messaging override the classic fairy tale elements.",
    concerns: [
      { issue: "Race-swapping", severity: "high", details: "Ariel cast as black actress despite original red-haired white character established in 1989 film" },
      { issue: "Source deviation", severity: "moderate", details: "Changes to original Danish fairy tale and Disney animated classic for diversity goals" },
      { issue: "Modernized lyrics", severity: "low", details: "Updated lyrics remove references some found problematic, altering original artistic vision" }
    ],
    positives: [
      "Retains core story of sacrifice and love",
      "Family-friendly content without explicit material",
      "Strong musical performances"
    ],
    sources: [
      { title: "The Little Mermaid - Rotten Tomatoes", url: "https://www.rottentomatoes.com/m/the_little_mermaid_2023" },
      { title: "IMDb - The Little Mermaid (2023)", url: "https://www.imdb.com/title/tt5971474/" }
    ],
    disclaimer: "This analysis reflects a Traditional perspective (level 8/10). Different viewpoints may interpret this content differently."
  },

  // The Little Mermaid (2023) - Progressive perspective
  "the little mermaid|2": {
    title: "The Little Mermaid",
    type: "movie",
    year: "2023",
    perspectiveLevel: 2,
    perspectiveLabel: "Progressive",
    summary: "Disney's groundbreaking live-action remake stars Halle Bailey as Ariel, marking a historic moment in representation. The film modernizes the classic tale while celebrating diversity and inclusion.",
    rating: 8,
    ratingExplanation: "Historic casting of a Black lead in a Disney princess role represents major progress in representation.",
    concerns: [
      { issue: "Traditional romance", severity: "low", details: "Still centers heteronormative love story as primary narrative" },
      { issue: "Monarchy themes", severity: "low", details: "Maintains royal/class hierarchy without critique" }
    ],
    positives: [
      "Historic representation with Halle Bailey as first Black live-action Disney princess",
      "Empowered female lead with more agency than original",
      "Diverse casting throughout supporting roles",
      "Updated lyrics remove outdated gender messaging"
    ],
    sources: [
      { title: "The Little Mermaid - Rotten Tomatoes", url: "https://www.rottentomatoes.com/m/the_little_mermaid_2023" },
      { title: "IMDb - The Little Mermaid (2023)", url: "https://www.imdb.com/title/tt5971474/" }
    ],
    disclaimer: "This analysis reflects a Progressive perspective (level 2/10). Different viewpoints may interpret this content differently."
  },

  // Luca - Conservative perspective
  "luca|8": {
    title: "Luca",
    type: "movie",
    year: "2021",
    perspectiveLevel: 8,
    perspectiveLabel: "Traditional",
    summary: "Pixar's coming-of-age story about sea monsters in the Italian Riviera. While family-friendly on the surface, the film has been interpreted by many as an LGBTQ allegory about hiding one's true identity.",
    rating: 5,
    ratingExplanation: "Wholesome friendship story undermined by widely-discussed queer subtext and allegory.",
    concerns: [
      { issue: "LGBTQ allegory", severity: "high", details: "Director acknowledged queer interpretations; hiding identity parallels coming out narratives" },
      { issue: "Subversive messaging", severity: "moderate", details: "Themes of hiding true self from family mirror LGBTQ experiences" },
      { issue: "Physical affection", severity: "low", details: "Close physical contact between male leads throughout film" }
    ],
    positives: [
      "No explicit LGBTQ content or relationships shown",
      "Beautiful Italian setting celebrates European culture",
      "Themes of friendship and loyalty",
      "Family-friendly with no violence or inappropriate content"
    ],
    sources: [
      { title: "Luca - IMDb", url: "https://www.imdb.com/title/tt12801262/" },
      { title: "Luca - Rotten Tomatoes", url: "https://www.rottentomatoes.com/m/luca_2021" }
    ],
    disclaimer: "This analysis reflects a Traditional perspective (level 8/10). Different viewpoints may interpret this content differently."
  },

  // Luca - Progressive perspective
  "luca|2": {
    title: "Luca",
    type: "movie",
    year: "2021",
    perspectiveLevel: 2,
    perspectiveLabel: "Progressive",
    summary: "Pixar's beautifully crafted allegory about difference, acceptance, and being true to oneself. The film resonates deeply with LGBTQ audiences through its themes of hiding identity and finding acceptance.",
    rating: 7,
    ratingExplanation: "Strong allegory for LGBTQ experience, though lacks explicit representation.",
    concerns: [
      { issue: "Implicit only", severity: "moderate", details: "Queer themes remain subtextual rather than explicit representation" },
      { issue: "No confirmation", severity: "low", details: "Disney/Pixar avoided confirming LGBTQ reading of the story" }
    ],
    positives: [
      "Powerful coming-out allegory resonates with LGBTQ viewers",
      "Celebrates being different and finding acceptance",
      "Director welcomed queer interpretations of the film",
      "Challenges conformity and fear of difference"
    ],
    sources: [
      { title: "Luca - IMDb", url: "https://www.imdb.com/title/tt12801262/" },
      { title: "Luca - Rotten Tomatoes", url: "https://www.rottentomatoes.com/m/luca_2021" }
    ],
    disclaimer: "This analysis reflects a Progressive perspective (level 2/10). Different viewpoints may interpret this content differently."
  },

  // Barbie - Conservative perspective
  "barbie|8": {
    title: "Barbie",
    type: "movie",
    year: "2023",
    perspectiveLevel: 8,
    perspectiveLabel: "Traditional",
    summary: "Greta Gerwig's film presents a heavily feminist narrative that portrays men negatively and pushes progressive ideology. Ken is depicted as foolish while the film lectures on patriarchy.",
    rating: 2,
    ratingExplanation: "Overtly feminist messaging, anti-male themes, and progressive indoctrination throughout.",
    concerns: [
      { issue: "Feminist propaganda", severity: "high", details: "Film explicitly critiques patriarchy and traditional gender roles" },
      { issue: "Anti-male messaging", severity: "high", details: "Male characters portrayed as incompetent or villainous" },
      { issue: "Gender ideology", severity: "moderate", details: "Promotes fluid understanding of gender and identity" },
      { issue: "Political messaging", severity: "moderate", details: "Heavy-handed social commentary on women's issues" }
    ],
    positives: [
      "High production quality and visual creativity",
      "Some humor appeals broadly"
    ],
    sources: [
      { title: "Barbie - IMDb", url: "https://www.imdb.com/title/tt1517268/" },
      { title: "Barbie - Rotten Tomatoes", url: "https://www.rottentomatoes.com/m/barbie" }
    ],
    disclaimer: "This analysis reflects a Traditional perspective (level 8/10). Different viewpoints may interpret this content differently."
  },

  // Barbie - Progressive perspective
  "barbie|2": {
    title: "Barbie",
    type: "movie",
    year: "2023",
    perspectiveLevel: 2,
    perspectiveLabel: "Progressive",
    summary: "Greta Gerwig's brilliant feminist satire deconstructs patriarchy and explores women's experiences with humor and heart. A landmark film for mainstream feminist cinema.",
    rating: 9,
    ratingExplanation: "Groundbreaking feminist film that brings progressive themes to mainstream audiences.",
    concerns: [
      { issue: "Corporate product", severity: "low", details: "Still fundamentally a Mattel brand promotion" }
    ],
    positives: [
      "Powerful feminist commentary accessible to mainstream audiences",
      "Critiques patriarchy and toxic masculinity effectively",
      "Celebrates women's complexity and humanity",
      "Directed by acclaimed female filmmaker Greta Gerwig",
      "Diverse cast and inclusive representation"
    ],
    sources: [
      { title: "Barbie - IMDb", url: "https://www.imdb.com/title/tt1517268/" },
      { title: "Barbie - Rotten Tomatoes", url: "https://www.rottentomatoes.com/m/barbie" }
    ],
    disclaimer: "This analysis reflects a Progressive perspective (level 2/10). Different viewpoints may interpret this content differently."
  },

  // Top Gun Maverick - Conservative perspective
  "top gun maverick|8": {
    title: "Top Gun: Maverick",
    type: "movie",
    year: "2022",
    perspectiveLevel: 8,
    perspectiveLabel: "Traditional",
    summary: "A triumphant celebration of American military excellence, patriotism, and traditional values. Tom Cruise delivers an apolitical action film focused on skill, duty, and heroism.",
    rating: 9,
    ratingExplanation: "Unapologetically patriotic film celebrating military service without progressive messaging.",
    concerns: [
      { issue: "Minor diversity casting", severity: "low", details: "Some diverse pilots included but not forced or central to plot" }
    ],
    positives: [
      "Celebrates American military and patriotism",
      "Traditional masculine heroism without deconstruction",
      "No political messaging or social commentary",
      "Honors legacy and mentorship across generations",
      "Practical stunts over CGI shows respect for craft"
    ],
    sources: [
      { title: "Top Gun: Maverick - IMDb", url: "https://www.imdb.com/title/tt1745960/" },
      { title: "Top Gun: Maverick - Rotten Tomatoes", url: "https://www.rottentomatoes.com/m/top_gun_maverick" }
    ],
    disclaimer: "This analysis reflects a Traditional perspective (level 8/10). Different viewpoints may interpret this content differently."
  },

  // Sound of Freedom - Conservative perspective
  "sound of freedom|8": {
    title: "Sound of Freedom",
    type: "movie",
    year: "2023",
    perspectiveLevel: 8,
    perspectiveLabel: "Traditional",
    summary: "Faith-based thriller about a federal agent rescuing children from trafficking. The film highlights an issue often ignored by mainstream media and Hollywood.",
    rating: 10,
    ratingExplanation: "Powerful faith-driven film tackling child trafficking that mainstream Hollywood refused to make.",
    concerns: [],
    positives: [
      "Highlights child trafficking issue often ignored by media",
      "Faith-based message of protecting the innocent",
      "Based on true story of heroic rescue efforts",
      "Made outside Hollywood system without progressive interference",
      "Celebrates traditional heroism and sacrifice"
    ],
    sources: [
      { title: "Sound of Freedom - IMDb", url: "https://www.imdb.com/title/tt7599146/" },
      { title: "Sound of Freedom - Rotten Tomatoes", url: "https://www.rottentomatoes.com/m/sound_of_freedom" }
    ],
    disclaimer: "This analysis reflects a Traditional perspective (level 8/10). Different viewpoints may interpret this content differently."
  },

  // The Last of Us - Conservative perspective
  "the last of us|8": {
    title: "The Last of Us",
    type: "tv_show",
    year: "2023",
    perspectiveLevel: 8,
    perspectiveLabel: "Traditional",
    summary: "HBO's adaptation features a prominent gay relationship in Episode 3 and later reveals the main character Ellie is lesbian. Well-made but pushes LGBTQ content.",
    rating: 4,
    ratingExplanation: "Quality production undermined by prominent LGBTQ storylines and characters.",
    concerns: [
      { issue: "Gay episode", severity: "high", details: "Episode 3 devoted entirely to gay male relationship" },
      { issue: "Lesbian protagonist", severity: "high", details: "Main character Ellie revealed as lesbian with girlfriend storyline" },
      { issue: "Extreme violence", severity: "moderate", details: "Graphic violence throughout may disturb some viewers" }
    ],
    positives: [
      "High production quality and acting",
      "Strong father-daughter surrogate relationship",
      "Themes of sacrifice and protection"
    ],
    sources: [
      { title: "The Last of Us - IMDb", url: "https://www.imdb.com/title/tt3581920/" },
      { title: "The Last of Us - Rotten Tomatoes", url: "https://www.rottentomatoes.com/tv/the_last_of_us" }
    ],
    disclaimer: "This analysis reflects a Traditional perspective (level 8/10). Different viewpoints may interpret this content differently."
  },

  // The Last of Us - Progressive perspective
  "the last of us|2": {
    title: "The Last of Us",
    type: "tv_show",
    year: "2023",
    perspectiveLevel: 2,
    perspectiveLabel: "Progressive",
    summary: "HBO's acclaimed adaptation features groundbreaking LGBTQ representation including a beautiful gay love story in Episode 3 and a lesbian protagonist. Sets new standard for inclusion in prestige TV.",
    rating: 9,
    ratingExplanation: "Landmark LGBTQ representation in mainstream prestige television.",
    concerns: [
      { issue: "Violence", severity: "low", details: "Extreme violence may limit accessibility for some viewers" }
    ],
    positives: [
      "Episode 3's gay love story praised as one of TV's best episodes ever",
      "Lesbian protagonist Ellie portrayed authentically",
      "LGBTQ characters fully dimensional, not tokenized",
      "Normalizes queer relationships in mainstream entertainment",
      "Diverse cast and crew"
    ],
    sources: [
      { title: "The Last of Us - IMDb", url: "https://www.imdb.com/title/tt3581920/" },
      { title: "The Last of Us - Rotten Tomatoes", url: "https://www.rottentomatoes.com/tv/the_last_of_us" }
    ],
    disclaimer: "This analysis reflects a Progressive perspective (level 2/10). Different viewpoints may interpret this content differently."
  },

  // Snow White (2025) - Conservative perspective (anticipated)
  "snow white|8": {
    title: "Snow White",
    type: "movie",
    year: "2025",
    perspectiveLevel: 8,
    perspectiveLabel: "Traditional",
    summary: "Disney's live-action remake casts Rachel Zegler, a Latina actress, as Snow White and removes the dwarfs. Lead actress made controversial political statements criticizing the original film.",
    rating: 2,
    ratingExplanation: "Race-swapped lead, removed dwarfs, and lead actress's anti-traditional comments indicate heavy progressive agenda.",
    concerns: [
      { issue: "Race-swapping", severity: "high", details: "Snow White, literally named for her white skin, cast with Latina actress" },
      { issue: "Dwarf removal", severity: "high", details: "Seven Dwarfs replaced with 'magical creatures' after activist pressure" },
      { issue: "Actress statements", severity: "high", details: "Rachel Zegler criticized original film as outdated, mocked Prince Charming" },
      { issue: "Feminist rewrite", severity: "moderate", details: "Romance reportedly minimized, focus on female empowerment" }
    ],
    positives: [
      "High budget production values expected"
    ],
    sources: [
      { title: "Snow White - IMDb", url: "https://www.imdb.com/title/tt5765770/" }
    ],
    disclaimer: "This analysis reflects a Traditional perspective (level 8/10). Different viewpoints may interpret this content differently."
  },

  // Oppenheimer - Moderate perspective
  "oppenheimer|5": {
    title: "Oppenheimer",
    type: "movie",
    year: "2023",
    perspectiveLevel: 5,
    perspectiveLabel: "Moderate",
    summary: "Christopher Nolan's epic biographical drama about the father of the atomic bomb. A complex, nuanced film that avoids taking strong political stances while exploring moral ambiguity.",
    rating: 7,
    ratingExplanation: "Masterfully crafted film that presents historical events without heavy-handed messaging.",
    concerns: [
      { issue: "Brief nudity", severity: "moderate", details: "Sexual scenes with nudity may concern some family viewers" },
      { issue: "Communist sympathy", severity: "low", details: "Film depicts Oppenheimer's leftist associations factually" }
    ],
    positives: [
      "Focuses on historical accuracy over modern politics",
      "Complex portrayal avoids simplistic hero/villain framing",
      "Celebrates American scientific achievement",
      "Practical filmmaking without excessive CGI",
      "Strong performances throughout"
    ],
    sources: [
      { title: "Oppenheimer - IMDb", url: "https://www.imdb.com/title/tt15398776/" },
      { title: "Oppenheimer - Rotten Tomatoes", url: "https://www.rottentomatoes.com/m/oppenheimer_2023" }
    ],
    disclaimer: "This analysis reflects a Moderate perspective (level 5/10). Different viewpoints may interpret this content differently."
  }
};

// Helper to find seed data with fuzzy matching
export function findSeedData(title: string, level: number): MediaAnalysis | null {
  const normalizedTitle = title.toLowerCase().trim();

  // Try exact match first
  const exactKey = `${normalizedTitle}|${level}`;
  if (seedData[exactKey]) {
    return seedData[exactKey];
  }

  // Try to find closest level match for same title
  const titleMatches = Object.keys(seedData).filter(key =>
    key.startsWith(`${normalizedTitle}|`)
  );

  if (titleMatches.length > 0) {
    // Find closest level
    let closestKey = titleMatches[0];
    let closestDiff = Math.abs(level - parseInt(closestKey.split('|')[1]));

    for (const key of titleMatches) {
      const keyLevel = parseInt(key.split('|')[1]);
      const diff = Math.abs(level - keyLevel);
      if (diff < closestDiff) {
        closestKey = key;
        closestDiff = diff;
      }
    }

    // Only use if within 2 levels
    if (closestDiff <= 2) {
      const data = { ...seedData[closestKey] };
      // Adjust perspective info for requested level
      data.perspectiveLevel = level;
      return data;
    }
  }

  return null;
}
