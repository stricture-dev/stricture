import { useState } from 'react';
import './PresetSelector.css';

interface Question {
  id: string;
  question: string;
  options: {
    text: string;
    points: Record<string, number>;
  }[];
}

interface Preset {
  id: string;
  name: string;
  description: string;
  package: string;
  docsUrl: string;
  tags: string[];
}

const questions: Question[] = [
  {
    id: 'project-type',
    question: 'What type of project are you building?',
    options: [
      { text: 'Web application (Next.js, React, Vue)', points: { nextjs: 2, modular: 1, layered: 1 } },
      { text: 'Backend API (Express, NestJS)', points: { hexagonal: 2, layered: 2, nestjs: 2 } },
      { text: 'Full-stack application', points: { layered: 2, clean: 1, hexagonal: 1 } },
      { text: 'Microservices', points: { hexagonal: 2, clean: 2 } },
      { text: 'Library or SDK', points: { modular: 2, clean: 1 } },
    ],
  },
  {
    id: 'team-size',
    question: 'What is your team size?',
    options: [
      { text: 'Solo developer', points: { layered: 1, nextjs: 1, nestjs: 1 } },
      { text: 'Small team (2-5)', points: { hexagonal: 1, layered: 2, modular: 1 } },
      { text: 'Medium team (6-15)', points: { hexagonal: 2, clean: 2, modular: 2 } },
      { text: 'Large team (15+)', points: { clean: 2, modular: 3, hexagonal: 1 } },
    ],
  },
  {
    id: 'complexity',
    question: 'How complex is your business logic?',
    options: [
      { text: 'Simple CRUD operations', points: { layered: 2, nextjs: 1, nestjs: 1 } },
      { text: 'Moderate complexity', points: { hexagonal: 1, layered: 1, modular: 1 } },
      { text: 'Complex domain logic', points: { hexagonal: 3, clean: 3 } },
      { text: 'Very complex with many business rules', points: { hexagonal: 3, clean: 3 } },
    ],
  },
  {
    id: 'testing',
    question: 'How important is testability?',
    options: [
      { text: 'Not a priority right now', points: { layered: 1, nextjs: 1 } },
      { text: 'Moderate priority', points: { layered: 1, modular: 1 } },
      { text: 'Very important', points: { hexagonal: 2, clean: 2 } },
      { text: 'Critical - need 80%+ coverage', points: { hexagonal: 3, clean: 3 } },
    ],
  },
  {
    id: 'framework',
    question: 'What framework are you using?',
    options: [
      { text: 'Next.js', points: { nextjs: 5 } },
      { text: 'NestJS', points: { nestjs: 5 } },
      { text: 'Express, Fastify, or Koa', points: { hexagonal: 1, layered: 1 } },
      { text: 'React, Vue, or Angular (frontend only)', points: { modular: 2 } },
      { text: 'No framework / Custom', points: { hexagonal: 1, clean: 1, layered: 1 } },
    ],
  },
];

const presets: Preset[] = [
  {
    id: 'hexagonal',
    name: 'Hexagonal Architecture',
    description: 'Ports & Adapters pattern with pure domain logic. Best for complex business logic and high testability.',
    package: '@stricture/hexagonal',
    docsUrl: '/docs/presets/hexagonal/',
    tags: ['Backend', 'Complex Logic', 'High Testability'],
  },
  {
    id: 'layered',
    name: 'Layered Architecture',
    description: 'Traditional N-tier architecture. Great for established teams and moderate complexity.',
    package: '@stricture/layered',
    docsUrl: '/docs/presets/layered/',
    tags: ['Full-stack', 'Traditional', 'Easy to Learn'],
  },
  {
    id: 'clean',
    name: 'Clean Architecture',
    description: "Uncle Bob's concentric circles. Ideal for complex domains and long-term maintainability.",
    package: '@stricture/clean',
    docsUrl: '/docs/presets/clean/',
    tags: ['Complex Logic', 'Long-term', 'High Testability'],
  },
  {
    id: 'modular',
    name: 'Modular Architecture',
    description: 'Feature-based modules with public APIs. Perfect for large teams and microservices.',
    package: '@stricture/modular',
    docsUrl: '/docs/presets/modular/',
    tags: ['Large Teams', 'Microservices', 'Scalable'],
  },
  {
    id: 'nextjs',
    name: 'Next.js Patterns',
    description: 'Server/Client component boundaries for Next.js App Router.',
    package: '@stricture/nextjs',
    docsUrl: '/docs/presets/nextjs/',
    tags: ['Next.js', 'React', 'Frontend'],
  },
  {
    id: 'nestjs',
    name: 'NestJS Patterns',
    description: 'Module encapsulation and layered patterns for NestJS.',
    package: '@stricture/nestjs',
    docsUrl: '/docs/presets/nestjs/',
    tags: ['NestJS', 'Backend', 'TypeScript'],
  },
];

export default function PresetSelector() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (points: Record<string, number>) => {
    // Add points to scores
    const newScores = { ...scores };
    Object.entries(points).forEach(([preset, value]) => {
      newScores[preset] = (newScores[preset] || 0) + value;
    });
    setScores(newScores);

    // Move to next question or show result
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };

  const restart = () => {
    setCurrentQuestion(0);
    setScores({});
    setShowResult(false);
  };

  // Get recommended preset (highest score)
  const getRecommendation = () => {
    const sortedPresets = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .map(([id]) => presets.find((p) => p.id === id))
      .filter((p): p is Preset => p !== undefined);

    return sortedPresets;
  };

  if (showResult) {
    const recommendations = getRecommendation();
    const topPreset = recommendations[0];
    const alternativePresets = recommendations.slice(1, 3);

    return (
      <div className="preset-selector">
        <div className="result">
          <h3>✨ Recommended Preset</h3>
          {topPreset && (
            <div className="preset-card recommended">
              <h4>{topPreset.name}</h4>
              <p>{topPreset.description}</p>
              <div className="tags">
                {topPreset.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="actions">
                <a href={topPreset.docsUrl} className="btn btn-primary">
                  View Documentation
                </a>
                <code className="install-cmd">{topPreset.package}</code>
              </div>
            </div>
          )}

          {alternativePresets.length > 0 && (
            <>
              <h4 style={{ marginTop: '2rem' }}>Alternative Options</h4>
              <div className="alternatives">
                {alternativePresets.map((preset) => (
                  <div key={preset.id} className="preset-card alternative">
                    <h5>{preset.name}</h5>
                    <p>{preset.description}</p>
                    <a href={preset.docsUrl}>Learn more →</a>
                  </div>
                ))}
              </div>
            </>
          )}

          <button onClick={restart} className="btn btn-secondary" style={{ marginTop: '2rem' }}>
            Start Over
          </button>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="preset-selector">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="question-counter">
        Question {currentQuestion + 1} of {questions.length}
      </div>
      <h3 className="question">{question.question}</h3>
      <div className="options">
        {question.options.map((option, index) => (
          <button key={index} onClick={() => handleAnswer(option.points)} className="option-btn">
            {option.text}
          </button>
        ))}
      </div>
      <button onClick={restart} className="btn-link">
        Restart
      </button>
    </div>
  );
}
