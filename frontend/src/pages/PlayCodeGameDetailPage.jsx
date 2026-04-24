import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BrainCircuit,
  Bug,
  CheckCircle2,
  Code2,
  Gamepad2,
  Puzzle,
  RotateCcw,
  Timer,
  Trophy,
  XCircle,
} from 'lucide-react';
import Navbar from '../components/sheryians/Navbar';
import Footer from '../components/sheryians/Footer';
import { codeGames } from '../data/codeGames';

const iconByGameId = {
  'loop-runner': Gamepad2,
  'debug-dungeon': Bug,
  'array-arena': Code2,
  'algorithm-race': Timer,
  'sql-quest': Puzzle,
  'system-design-sim': BrainCircuit,
};

const flowByGameId = {
  'loop-runner': ['Set repeat count', 'Run loop', 'Avoid obstacles', 'Reach finish'],
  'debug-dungeon': ['Read code', 'Choose fix', 'Check answer', 'Complete all rooms'],
  'array-arena': ['Perform array operations', 'Track mission steps', 'Complete all goals'],
  'algorithm-race': ['Read scenario', 'Pick best strategy', 'Finish all rounds'],
  'sql-quest': ['Select query fields', 'Run query', 'Match target output'],
  'system-design-sim': ['Choose components', 'Set database and scaling', 'Evaluate architecture'],
};

const SectionCard = ({ title, children }) => (
  <section className="rounded-3xl border border-white/15 bg-[linear-gradient(180deg,rgba(20,20,24,0.95),rgba(6,6,8,0.98))] p-5 md:p-7">
    <h2 className="text-xl font-semibold tracking-tight md:text-2xl">{title}</h2>
    <div className="mt-4">{children}</div>
  </section>
);

const StepBadge = ({ done, label }) => (
  <div
    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs md:text-sm ${
      done
        ? 'border-emerald-400/45 bg-emerald-500/15 text-emerald-200'
        : 'border-white/20 bg-white/5 text-white/70'
    }`}
  >
    {done ? <CheckCircle2 className="h-4 w-4" /> : <span className="h-4 w-4 rounded-full border border-white/35" />}
    {label}
  </div>
);

const LoopRunnerGame = () => {
  const trackLength = 10;
  const finishCell = trackLength - 1;
  const obstacles = [3, 6];
  const [position, setPosition] = useState(0);
  const [loopCount, setLoopCount] = useState(1);
  const [message, setMessage] = useState('Set a loop count and click Run Loop.');
  const [won, setWon] = useState(false);

  const runLoop = () => {
    if (won) {
      return;
    }

    const steps = Math.max(1, Math.min(5, Number(loopCount) || 1));
    let crashAt = null;
    let nextPosition = position;

    for (let i = 1; i <= steps; i += 1) {
      const current = position + i;
      if (obstacles.includes(current)) {
        crashAt = current;
        break;
      }
      nextPosition = current;
    }

    if (crashAt !== null) {
      setPosition(crashAt);
      setMessage(`Oops! You hit obstacle at cell ${crashAt}. Reset and try another loop count.`);
      return;
    }

    if (nextPosition >= finishCell) {
      setPosition(finishCell);
      setWon(true);
      setMessage('Great! You reached the finish line.');
      return;
    }

    setPosition(nextPosition);
    setMessage(`Runner moved to cell ${nextPosition}. Keep going.`);
  };

  const reset = () => {
    setPosition(0);
    setLoopCount(1);
    setWon(false);
    setMessage('Set a loop count and click Run Loop.');
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/70 md:text-base">
        Goal: Use loop count smartly to reach the finish without hitting obstacle cells.
      </p>

      <div className="grid grid-cols-5 gap-2 md:grid-cols-10">
        {Array.from({ length: trackLength }).map((_, index) => {
          const isRunner = index === position;
          const isObstacle = obstacles.includes(index);
          const isFinish = index === finishCell;
          return (
            <div
              key={`cell-${index}`}
              className={`flex h-14 items-center justify-center rounded-xl border text-xs font-medium md:h-16 md:text-sm ${
                isRunner
                  ? 'border-emerald-300 bg-emerald-500/30 text-emerald-100'
                  : isObstacle
                    ? 'border-rose-400/50 bg-rose-500/20 text-rose-200'
                    : isFinish
                      ? 'border-amber-400/50 bg-amber-400/20 text-amber-100'
                      : 'border-white/15 bg-white/5 text-white/70'
              }`}
            >
              {isRunner ? '🏃' : isObstacle ? 'X' : isFinish ? '🏁' : index}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-white/75">Repeat count (1-5)</label>
        <input
          type="number"
          min={1}
          max={5}
          value={loopCount}
          onChange={(event) => setLoopCount(event.target.value)}
          className="h-10 w-24 rounded-lg border border-white/20 bg-black/60 px-3 text-sm text-white focus:border-emerald-400/70 focus:outline-none"
        />
        <button
          type="button"
          onClick={runLoop}
          className="rounded-lg border border-emerald-400/45 bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/25"
        >
          Run Loop
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      </div>

      <p className={`text-sm md:text-base ${won ? 'text-emerald-300' : 'text-white/75'}`}>{message}</p>
    </div>
  );
};

const debugChallenges = [
  {
    prompt: 'Fix the loop to include number 5.',
    code: 'for (let i = 1; i < 5; i++) {\n  console.log(i);\n}',
    options: ['Change i < 5 to i <= 5', 'Change i = 1 to i = 0', 'Remove i++'],
    correctIndex: 0,
    explanation: 'Using <= includes 5 in the loop output.',
  },
  {
    prompt: 'Fix the function so it returns a value.',
    code: 'function add(a, b) {\n  a + b;\n}',
    options: ['console.log(a + b)', 'return a + b', 'add(a, b)'],
    correctIndex: 1,
    explanation: 'A function must use return to send value back.',
  },
  {
    prompt: 'Fix object access to print the name.',
    code: "const user = { name: 'Asha' };\nconsole.log(user['fullName']);",
    options: ['console.log(user.name)', "console.log(user['name'])", 'Both A and B'],
    correctIndex: 2,
    explanation: 'Both dot notation and bracket notation with "name" work.',
  },
];

const DebugDungeonGame = () => {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const challenge = debugChallenges[index];
  const isCorrect = selected === challenge.correctIndex;
  const isLast = index === debugChallenges.length - 1;

  const checkAnswer = () => {
    if (selected === null || checked) {
      return;
    }
    setChecked(true);
    if (selected === challenge.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const next = () => {
    if (!checked) {
      return;
    }
    if (isLast) {
      setIndex(0);
      setSelected(null);
      setChecked(false);
      return;
    }
    setIndex((prev) => prev + 1);
    setSelected(null);
    setChecked(false);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/70 md:text-base">
        Room {index + 1}/{debugChallenges.length}: {challenge.prompt}
      </p>
      <pre className="overflow-auto rounded-xl border border-white/15 bg-black/70 p-4 text-xs text-emerald-200 md:text-sm">
        {challenge.code}
      </pre>

      <div className="space-y-2.5">
        {challenge.options.map((option, optionIndex) => (
          <button
            key={option}
            type="button"
            onClick={() => !checked && setSelected(optionIndex)}
            className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition md:text-base ${
              selected === optionIndex
                ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-100'
                : 'border-white/20 bg-white/5 text-white/85 hover:bg-white/10'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={checkAnswer}
          className="rounded-lg border border-emerald-400/45 bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/25"
        >
          Check Answer
        </button>
        <button
          type="button"
          onClick={next}
          className="rounded-lg border border-white/25 px-4 py-2 text-sm text-white/85 transition hover:bg-white/10"
        >
          {isLast ? 'Play Again' : 'Next Room'}
        </button>
        <span className="text-sm text-white/70">Score: {score}</span>
      </div>

      {checked ? (
        <p className={`text-sm md:text-base ${isCorrect ? 'text-emerald-300' : 'text-rose-300'}`}>
          {isCorrect ? 'Correct! ' : 'Not quite. '}
          {challenge.explanation}
        </p>
      ) : null}
    </div>
  );
};

const ArrayArenaGame = () => {
  const [values, setValues] = useState([2, 4, 6]);
  const [inputValue, setInputValue] = useState('');
  const [sum, setSum] = useState(0);
  const [lastAction, setLastAction] = useState('No operation yet.');
  const [mission, setMission] = useState({
    pushed: false,
    doubled: false,
    summed: false,
  });

  const pushValue = () => {
    const number = Number(inputValue);
    if (!Number.isFinite(number)) {
      setLastAction('Enter a valid number first.');
      return;
    }
    setValues((prev) => [...prev, number]);
    setMission((prev) => ({ ...prev, pushed: true }));
    setInputValue('');
    setLastAction(`Pushed ${number}`);
  };

  const popValue = () => {
    setValues((prev) => {
      if (prev.length === 0) {
        return prev;
      }
      const cloned = [...prev];
      const removed = cloned.pop();
      setLastAction(`Popped ${removed}`);
      return cloned;
    });
  };

  const doubleValues = () => {
    setValues((prev) => prev.map((item) => item * 2));
    setMission((prev) => ({ ...prev, doubled: true }));
    setLastAction('Mapped: multiplied each value by 2.');
  };

  const filterEven = () => {
    setValues((prev) => prev.filter((item) => item % 2 === 0));
    setLastAction('Filtered: kept even values only.');
  };

  const reduceSum = () => {
    const total = values.reduce((acc, current) => acc + current, 0);
    setSum(total);
    setMission((prev) => ({ ...prev, summed: true }));
    setLastAction(`Reduced sum = ${total}`);
  };

  const reset = () => {
    setValues([2, 4, 6]);
    setInputValue('');
    setSum(0);
    setLastAction('No operation yet.');
    setMission({ pushed: false, doubled: false, summed: false });
  };

  const missionDone = mission.pushed && mission.doubled && mission.summed;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <StepBadge done={mission.pushed} label="Push a number" />
        <StepBadge done={mission.doubled} label="Double values" />
        <StepBadge done={mission.summed} label="Get sum" />
      </div>

      <div className="rounded-xl border border-white/15 bg-black/65 p-4">
        <p className="text-sm text-white/60 md:text-base">Current Array</p>
        <p className="mt-2 font-mono text-lg text-emerald-200 md:text-2xl">[{values.join(', ')}]</p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <input
          type="number"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder="Number"
          className="h-10 w-28 rounded-lg border border-white/20 bg-black/60 px-3 text-sm text-white focus:border-emerald-400/70 focus:outline-none"
        />
        <button
          type="button"
          onClick={pushValue}
          className="rounded-lg border border-emerald-400/45 bg-emerald-500/15 px-3.5 py-2 text-sm text-emerald-200 transition hover:bg-emerald-500/25"
        >
          Push
        </button>
        <button
          type="button"
          onClick={popValue}
          className="rounded-lg border border-white/25 px-3.5 py-2 text-sm text-white/80 transition hover:bg-white/10"
        >
          Pop
        </button>
        <button
          type="button"
          onClick={doubleValues}
          className="rounded-lg border border-white/25 px-3.5 py-2 text-sm text-white/80 transition hover:bg-white/10"
        >
          Map x2
        </button>
        <button
          type="button"
          onClick={filterEven}
          className="rounded-lg border border-white/25 px-3.5 py-2 text-sm text-white/80 transition hover:bg-white/10"
        >
          Filter Even
        </button>
        <button
          type="button"
          onClick={reduceSum}
          className="rounded-lg border border-white/25 px-3.5 py-2 text-sm text-white/80 transition hover:bg-white/10"
        >
          Reduce Sum
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 px-3.5 py-2 text-sm text-white/75 transition hover:bg-white/10"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      </div>

      <div className="rounded-xl border border-white/15 bg-black/60 p-4 text-sm text-white/75 md:text-base">
        <p>Last Action: {lastAction}</p>
        <p className="mt-1">Current Sum: {sum}</p>
      </div>

      {missionDone ? (
        <p className="text-sm text-emerald-300 md:text-base">
          Nice! You completed all mission steps in Array Arena.
        </p>
      ) : null}
    </div>
  );
};

const raceQuestions = [
  {
    prompt: 'You need to check if a value exists in a sorted array of 1 million items.',
    options: ['Linear Search', 'Binary Search', 'Bubble Sort'],
    correct: 1,
    note: 'Binary search uses sorted order and works in O(log n).',
  },
  {
    prompt: 'Need quickest lookup by unique ID in memory.',
    options: ['Array scan', 'Hash Map', 'Nested loop'],
    correct: 1,
    note: 'Hash maps provide near O(1) average lookup.',
  },
  {
    prompt: 'Find top 10 from a huge stream continuously.',
    options: ['Store all and sort every time', 'Use min-heap of size 10', 'Use recursion only'],
    correct: 1,
    note: 'Heap keeps top K efficiently.',
  },
];

const AlgorithmRaceGame = () => {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const current = raceQuestions[index];
  const isCorrect = selected === current.correct;
  const done = index === raceQuestions.length - 1 && checked;

  const check = () => {
    if (selected === null || checked) {
      return;
    }
    setChecked(true);
    if (selected === current.correct) {
      setScore((prev) => prev + 1);
    }
  };

  const next = () => {
    if (!checked) {
      return;
    }
    if (index < raceQuestions.length - 1) {
      setIndex((prev) => prev + 1);
      setSelected(null);
      setChecked(false);
    }
  };

  const reset = () => {
    setIndex(0);
    setSelected(null);
    setChecked(false);
    setScore(0);
  };

  return (
    <div className="space-y-4">
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-emerald-400 transition-all"
          style={{ width: `${((index + (checked ? 1 : 0)) / raceQuestions.length) * 100}%` }}
        />
      </div>
      <p className="text-sm text-white/70 md:text-base">
        Round {index + 1}/{raceQuestions.length}
      </p>
      <p className="text-base text-white md:text-lg">{current.prompt}</p>

      <div className="space-y-2.5">
        {current.options.map((option, optionIndex) => (
          <button
            key={option}
            type="button"
            onClick={() => !checked && setSelected(optionIndex)}
            className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition md:text-base ${
              selected === optionIndex
                ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-100'
                : 'border-white/20 bg-white/5 text-white/85 hover:bg-white/10'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={check}
          className="rounded-lg border border-emerald-400/45 bg-emerald-500/15 px-4 py-2 text-sm text-emerald-200 transition hover:bg-emerald-500/25"
        >
          Lock Answer
        </button>
        <button
          type="button"
          onClick={next}
          className="rounded-lg border border-white/25 px-4 py-2 text-sm text-white/85 transition hover:bg-white/10"
        >
          Next
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 px-4 py-2 text-sm text-white/75 transition hover:bg-white/10"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
        <span className="text-sm text-white/70">Score: {score}</span>
      </div>

      {checked ? (
        <p className={`text-sm md:text-base ${isCorrect ? 'text-emerald-300' : 'text-rose-300'}`}>
          {isCorrect ? 'Correct. ' : 'Try another approach next round. '}
          {current.note}
        </p>
      ) : null}

      {done ? <p className="text-sm text-emerald-300 md:text-base">Race finished. Final score: {score}</p> : null}
    </div>
  );
};

const studentsData = [
  { id: 1, name: 'Aarav', score: 82, city: 'Kathmandu' },
  { id: 2, name: 'Mina', score: 74, city: 'Pokhara' },
  { id: 3, name: 'Suman', score: 91, city: 'Kathmandu' },
  { id: 4, name: 'Nima', score: 65, city: 'Biratnagar' },
];

const SQLQuestGame = () => {
  const [selectColumn, setSelectColumn] = useState('name');
  const [whereColumn, setWhereColumn] = useState('score');
  const [operator, setOperator] = useState('>=');
  const [value, setValue] = useState('80');
  const [result, setResult] = useState([]);
  const [message, setMessage] = useState('Build query and click Run Query.');

  const runQuery = () => {
    const filtered = studentsData.filter((row) => {
      if (whereColumn === 'score') {
        const target = Number(value);
        if (!Number.isFinite(target)) {
          return false;
        }
        if (operator === '>=') {
          return row.score >= target;
        }
        if (operator === '>') {
          return row.score > target;
        }
        if (operator === '=') {
          return row.score === target;
        }
      }

      if (whereColumn === 'city') {
        if (operator === '=') {
          return row.city.toLowerCase() === value.trim().toLowerCase();
        }
      }

      return false;
    });

    const projected = filtered.map((row) => row[selectColumn]);
    setResult(projected);

    const solved =
      selectColumn === 'name' &&
      whereColumn === 'score' &&
      operator === '>=' &&
      Number(value) === 80 &&
      projected.join(',') === 'Aarav,Suman';

    setMessage(solved ? 'Great! Mission complete.' : 'Query ran. Try matching the mission exactly.');
  };

  const reset = () => {
    setSelectColumn('name');
    setWhereColumn('score');
    setOperator('>=');
    setValue('80');
    setResult([]);
    setMessage('Build query and click Run Query.');
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/70 md:text-base">
        Mission: Get names of students where score is greater than or equal to 80.
      </p>

      <div className="overflow-auto rounded-xl border border-white/15">
        <table className="min-w-full text-left text-xs md:text-sm">
          <thead className="bg-white/5 text-white/75">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Score</th>
              <th className="px-3 py-2">City</th>
            </tr>
          </thead>
          <tbody>
            {studentsData.map((row) => (
              <tr key={row.id} className="border-t border-white/10">
                <td className="px-3 py-2">{row.name}</td>
                <td className="px-3 py-2">{row.score}</td>
                <td className="px-3 py-2">{row.city}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <select
          value={selectColumn}
          onChange={(event) => setSelectColumn(event.target.value)}
          className="h-10 rounded-lg border border-white/20 bg-black/60 px-3 text-sm text-white focus:border-emerald-400/70 focus:outline-none"
        >
          <option value="name">SELECT name</option>
          <option value="score">SELECT score</option>
          <option value="city">SELECT city</option>
        </select>

        <select
          value={whereColumn}
          onChange={(event) => setWhereColumn(event.target.value)}
          className="h-10 rounded-lg border border-white/20 bg-black/60 px-3 text-sm text-white focus:border-emerald-400/70 focus:outline-none"
        >
          <option value="score">WHERE score</option>
          <option value="city">WHERE city</option>
        </select>

        <select
          value={operator}
          onChange={(event) => setOperator(event.target.value)}
          className="h-10 rounded-lg border border-white/20 bg-black/60 px-3 text-sm text-white focus:border-emerald-400/70 focus:outline-none"
        >
          <option value=">=">{'>='}</option>
          <option value=">">{'>'}</option>
          <option value="=">{'='}</option>
        </select>

        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Value"
          className="h-10 rounded-lg border border-white/20 bg-black/60 px-3 text-sm text-white focus:border-emerald-400/70 focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={runQuery}
          className="rounded-lg border border-emerald-400/45 bg-emerald-500/15 px-4 py-2 text-sm text-emerald-200 transition hover:bg-emerald-500/25"
        >
          Run Query
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 px-4 py-2 text-sm text-white/75 transition hover:bg-white/10"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      </div>

      <div className="rounded-xl border border-white/15 bg-black/65 p-4 text-sm md:text-base">
        <p className="text-white/70">
          Query:{' '}
          <span className="font-mono text-emerald-200">
            SELECT {selectColumn} FROM students WHERE {whereColumn} {operator} {value}
          </span>
        </p>
        <p className="mt-2 text-white/75">
          Result: {result.length ? result.join(', ') : 'No rows returned'}
        </p>
      </div>

      <p className={`text-sm md:text-base ${message.includes('complete') ? 'text-emerald-300' : 'text-white/75'}`}>
        {message}
      </p>
    </div>
  );
};

const SystemDesignSimulatorGame = () => {
  const options = [
    'Load Balancer',
    'API Server',
    'Database',
    'Cache',
    'Rate Limiter',
    'Message Queue',
    'CDN',
  ];
  const required = ['Load Balancer', 'API Server', 'Database', 'Cache'];
  const bonus = ['Rate Limiter', 'Message Queue', 'CDN'];

  const [selected, setSelected] = useState([]);
  const [database, setDatabase] = useState('NoSQL');
  const [scaling, setScaling] = useState('Horizontal');
  const [score, setScore] = useState(null);
  const [feedback, setFeedback] = useState('Select architecture pieces and click Evaluate.');

  const toggleComponent = (component) => {
    setSelected((prev) =>
      prev.includes(component) ? prev.filter((item) => item !== component) : [...prev, component],
    );
  };

  const evaluate = () => {
    const requiredCount = required.filter((item) => selected.includes(item)).length;
    const bonusCount = bonus.filter((item) => selected.includes(item)).length;
    const dbScore = database === 'NoSQL' ? 10 : 5;
    const scalingScore = scaling === 'Horizontal' ? 10 : 4;
    const finalScore = requiredCount * 20 + bonusCount * 10 + dbScore + scalingScore;
    setScore(finalScore);

    const missing = required.filter((item) => !selected.includes(item));
    if (missing.length === 0) {
      setFeedback('Strong design! Core components are covered.');
    } else {
      setFeedback(`Missing core components: ${missing.join(', ')}`);
    }
  };

  const reset = () => {
    setSelected([]);
    setDatabase('NoSQL');
    setScaling('Horizontal');
    setScore(null);
    setFeedback('Select architecture pieces and click Evaluate.');
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/70 md:text-base">
        Scenario: Build a scalable URL shortener for high traffic.
      </p>

      <div className="grid gap-2.5 md:grid-cols-2">
        {options.map((component) => (
          <button
            key={component}
            type="button"
            onClick={() => toggleComponent(component)}
            className={`rounded-xl border px-4 py-3 text-left text-sm transition md:text-base ${
              selected.includes(component)
                ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-100'
                : 'border-white/20 bg-white/5 text-white/85 hover:bg-white/10'
            }`}
          >
            {component}
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm text-white/75">
          Database
          <select
            value={database}
            onChange={(event) => setDatabase(event.target.value)}
            className="mt-1.5 h-10 w-full rounded-lg border border-white/20 bg-black/60 px-3 text-sm text-white focus:border-emerald-400/70 focus:outline-none"
          >
            <option>NoSQL</option>
            <option>SQL</option>
          </select>
        </label>

        <label className="text-sm text-white/75">
          Scaling Style
          <select
            value={scaling}
            onChange={(event) => setScaling(event.target.value)}
            className="mt-1.5 h-10 w-full rounded-lg border border-white/20 bg-black/60 px-3 text-sm text-white focus:border-emerald-400/70 focus:outline-none"
          >
            <option>Horizontal</option>
            <option>Vertical</option>
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={evaluate}
          className="rounded-lg border border-emerald-400/45 bg-emerald-500/15 px-4 py-2 text-sm text-emerald-200 transition hover:bg-emerald-500/25"
        >
          Evaluate Design
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 px-4 py-2 text-sm text-white/75 transition hover:bg-white/10"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
        {score !== null ? (
          <span className="text-sm text-white/75">
            Score: <span className="text-emerald-300">{score}/100</span>
          </span>
        ) : null}
      </div>

      <p className="text-sm text-white/80 md:text-base">{feedback}</p>
    </div>
  );
};

const gameComponentById = {
  'loop-runner': LoopRunnerGame,
  'debug-dungeon': DebugDungeonGame,
  'array-arena': ArrayArenaGame,
  'algorithm-race': AlgorithmRaceGame,
  'sql-quest': SQLQuestGame,
  'system-design-sim': SystemDesignSimulatorGame,
};

const PlayCodeGameDetailPage = () => {
  const { gameId } = useParams();
  const game = useMemo(() => codeGames.find((item) => item.id === gameId), [gameId]);
  const Icon = iconByGameId[gameId];
  const GameComponent = gameComponentById[gameId];

  if (!game || !GameComponent) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <main className="mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center px-6 pt-28 text-center">
          <h1 className="text-3xl font-semibold md:text-5xl">Game not found</h1>
          <p className="mt-3 text-white/70">Please go back and select a valid game.</p>
          <Link
            to="/play-code-game"
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-emerald-400/45 bg-emerald-500/12 px-5 py-3 text-sm text-emerald-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Games
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const flow = flowByGameId[gameId] || [];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 selection:text-emerald-100">
      <Navbar />

      <main className="relative overflow-x-hidden pb-24 pt-28 md:pt-32">
        <section className="relative px-4 py-8 md:px-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(16,185,129,0.22),rgba(0,0,0,0.97)_62%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:200px_200px] opacity-25" />
          </div>

          <div className="relative mx-auto max-w-6xl">
            <Link
              to="/play-code-game"
              className="inline-flex items-center gap-2 text-sm text-white/75 transition hover:text-white md:text-base"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to all games
            </Link>

            <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="inline-flex rounded-sm border border-emerald-500/35 bg-emerald-700/20 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-emerald-300">
                  Play Code Game
                </div>
                <h1 className="mt-4 text-[2rem] font-semibold leading-[1.1] tracking-tight md:text-[3.4rem]">
                  {game.title}
                </h1>
                <p className="mt-3 max-w-3xl text-sm text-white/70 md:text-base">{game.description}</p>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/35 bg-emerald-500/12 px-4 py-3">
                {Icon ? <Icon className="h-6 w-6 text-emerald-300" /> : null}
                <div>
                  <p className="text-sm text-white/70">Difficulty</p>
                  <p className="text-base text-emerald-200">{game.difficulty}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[0.36fr_0.64fr]">
              <SectionCard title="Easy Flow">
                <div className="space-y-2">
                  {flow.map((step, index) => (
                    <div key={step} className="rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-sm text-white/80 md:text-base">
                      Step {index + 1}: {step}
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-xl border border-emerald-400/25 bg-emerald-500/12 p-3 text-xs text-emerald-100 md:text-sm">
                  Tip: Keep it simple. Try one action, check result, then move to next step.
                </div>
              </SectionCard>

              <SectionCard title="Game Playground">
                <GameComponent />
              </SectionCard>
            </div>

            <div className="mt-8 rounded-2xl border border-white/15 bg-[#0a0a0d]/85 p-4 md:p-6">
              <div className="flex flex-wrap items-center gap-3 text-sm text-white/75 md:text-base">
                <Trophy className="h-5 w-5 text-emerald-300" />
                <p>
                  Complete this game and move to the next one. Your coding logic improves fastest
                  through these interactive practice rounds.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PlayCodeGameDetailPage;

