import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import fs from "fs";
import path from "path";

// Load firebase-applet-config
const configPath = path.resolve(process.cwd(), "firebase-applet-config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

const coaches = [
  {
    id: "joe",
    name: "Joe",
    role: "Hypertrophy & Strength",
    tone: "espresso",
    bio: "Block-periodised hypertrophy. Muscle you can actually use. Expect rigorous form guidelines, progressive loads, and targeted accessory work.",
    specialties: ["Hypertrophy", "Strength", "Recovery"],
    initials: "JO",
    cert: "Strength · Hypertrophy",
    ptEligible: true,
    weekly_shifts: {
      "Mon": ["06:00", "07:00", "08:00", "09:00", "16:00", "17:00", "18:00", "19:00"],
      "Tue": ["06:00", "07:00", "08:00", "09:00", "16:00", "17:00", "18:00", "19:00"],
      "Wed": ["06:00", "07:00", "08:00", "09:00", "16:00", "17:00", "18:00", "19:00"],
      "Thu": ["06:00", "07:00", "08:00", "09:00", "16:00", "17:00", "18:00", "19:00"],
      "Fri": ["06:00", "07:00", "08:00", "09:00", "16:00", "17:00", "18:00", "19:00"],
      "Sat": ["07:00", "08:00", "09:00", "10:00", "11:00"]
    }
  },
  {
    id: "deb",
    name: "Deb",
    role: "Strength & Recovery",
    tone: "walnut",
    bio: "Post-rehab strength and long-term recovery planning. Focuses on core control, movement fidelity, and overcoming specific joint limitations safely.",
    specialties: ["Strength", "Recovery", "Hyrox Prep"],
    initials: "DB",
    cert: "Strength · Recovery",
    ptEligible: true,
    weekly_shifts: {
      "Mon": ["07:00", "08:00", "09:00", "10:00", "17:00", "18:00", "19:00", "20:00"],
      "Tue": ["07:00", "08:00", "09:00", "10:00", "17:00", "18:00", "19:00", "20:00"],
      "Wed": ["07:00", "08:00", "09:00", "10:00", "17:00", "18:00", "19:00", "20:00"],
      "Thu": ["07:00", "08:00", "09:00", "10:00", "17:00", "18:00", "19:00", "20:00"],
      "Fri": ["07:00", "08:00", "09:00", "10:00", "17:00", "18:00", "19:00", "20:00"],
      "Sat": ["08:00", "09:00", "10:00", "11:00", "12:00"]
    }
  },
  {
    id: "deepika",
    name: "Deepika",
    role: "Hyrox & Conditioning",
    tone: "terra",
    bio: "Zone 2 devotee turned Hyrox specialist. Endurance with structure, perfect technique under heavy cardiovascular fatigue, and functional strength.",
    specialties: ["Hyrox Prep", "Strength", "Conditioning"],
    initials: "DE",
    cert: "Hyrox · Strength",
    ptEligible: true,
    weekly_shifts: {
      "Mon": ["06:00", "07:00", "08:00", "16:00", "17:00", "18:00", "19:00"],
      "Tue": ["06:00", "07:00", "08:00", "16:00", "17:00", "18:00", "19:00"],
      "Wed": ["06:00", "07:00", "08:00", "16:00", "17:00", "18:00", "19:00"],
      "Thu": ["06:00", "07:00", "08:00", "16:00", "17:00", "18:00", "19:00"],
      "Fri": ["06:00", "07:00", "08:00", "16:00", "17:00", "18:00", "19:00"],
      "Sat": ["07:00", "08:00", "09:00", "10:00"]
    }
  },
  {
    id: "lee",
    name: "Lee",
    role: "Hypertrophy & Strength",
    tone: "sage",
    bio: "Form first, always. The coach who makes the last rep look exactly like the first. Combines exercise science with meticulous programming for clean strength gains.",
    specialties: ["Hypertrophy", "Strength", "Recovery"],
    initials: "LE",
    cert: "Hypertrophy · Strength",
    ptEligible: true,
    weekly_shifts: {
      "Mon": ["07:00", "08:00", "09:00", "15:00", "16:00", "17:00", "18:00"],
      "Tue": ["07:00", "08:00", "09:00", "15:00", "16:00", "17:00", "18:00"],
      "Wed": ["07:00", "08:00", "09:00", "15:00", "16:00", "17:00", "18:00"],
      "Thu": ["07:00", "08:00", "09:00", "15:00", "16:00", "17:00", "18:00"],
      "Fri": ["07:00", "08:00", "09:00", "15:00", "16:00", "17:00", "18:00"],
      "Sat": ["08:00", "09:00", "10:00", "11:00"]
    }
  },
  {
    id: "rahul",
    name: "Rahul",
    role: "Strength & Hyrox Prep",
    tone: "walnut",
    bio: "Competition-tested Hyrox coach. Builds high-output conditioning engines that don't quit in late rounds. Expert in raw power development and functional capacity.",
    specialties: ["Strength", "Hyrox Prep", "Conditioning"],
    initials: "RA",
    cert: "Strength · Hyrox · Recovery",
    ptEligible: true,
    weekly_shifts: {
      "Mon": ["06:00", "07:00", "08:00", "09:00", "17:00", "18:00", "19:00", "20:00"],
      "Tue": ["06:00", "07:00", "08:00", "09:00", "17:00", "18:00", "19:00", "20:00"],
      "Wed": ["06:00", "07:00", "08:00", "09:00", "17:00", "18:00", "19:00", "20:00"],
      "Thu": ["06:00", "07:00", "08:00", "09:00", "17:00", "18:00", "19:00", "20:00"],
      "Fri": ["06:00", "07:00", "08:00", "09:00", "17:00", "18:00", "19:00", "20:00"],
      "Sat": ["08:00", "09:00", "10:00", "11:00", "12:00"]
    }
  },
  {
    id: "aakash",
    name: "Aakash",
    role: "Strength & Recovery",
    tone: "clay",
    bio: "Old-school strength with new-school recovery protocols. Combines structured barbell compound lifts with mobility routines to keep athletes durable long-term.",
    specialties: ["Strength", "Recovery", "Mobility"],
    initials: "AK",
    cert: "Strength · Recovery",
    ptEligible: true,
    weekly_shifts: {
      "Mon": ["08:00", "09:00", "10:00", "11:00", "16:00", "17:00", "18:00", "19:00"],
      "Tue": ["08:00", "09:00", "10:00", "11:00", "16:00", "17:00", "18:00", "19:00"],
      "Wed": ["08:00", "09:00", "10:00", "11:00", "16:00", "17:00", "18:00", "19:00"],
      "Thu": ["08:00", "09:00", "10:00", "11:00", "16:00", "17:00", "18:00", "19:00"],
      "Fri": ["08:00", "09:00", "10:00", "11:00", "16:00", "17:00", "18:00", "19:00"],
      "Sat": ["09:00", "10:00", "11:00", "12:00", "13:00"]
    }
  },
  {
    id: "tarun",
    name: "Tarun",
    role: "Hyrox & Hypertrophy",
    tone: "clay",
    bio: "Hybrid athlete programming specializing in size, speed, and stamina. Balances high muscle hypertrophy programming with dynamic metabolic conditioning work.",
    specialties: ["Hyrox Prep", "Hypertrophy", "Strength"],
    initials: "TR",
    cert: "Hyrox · Hypertrophy",
    ptEligible: true,
    weekly_shifts: {
      "Mon": ["06:00", "07:00", "08:00", "15:00", "16:00", "17:00", "18:00"],
      "Tue": ["06:00", "07:00", "08:00", "15:00", "16:00", "17:00", "18:00"],
      "Wed": ["06:00", "07:00", "08:00", "15:00", "16:00", "17:00", "18:00"],
      "Thu": ["06:00", "07:00", "08:00", "15:00", "16:00", "17:00", "18:00"],
      "Fri": ["06:00", "07:00", "08:00", "15:00", "16:00", "17:00", "18:00"],
      "Sat": ["07:00", "08:00", "09:00", "10:00"]
    }
  },
  {
    id: "santo",
    name: "Santo",
    role: "Strength & Hypertrophy",
    tone: "espresso",
    bio: "Classical strength training with a bodybuilder's eye for micro-biomechanical details. Teaches high-frequency hypertrophy, power mechanics, and conditioning.",
    specialties: ["Strength", "Hypertrophy", "Conditioning"],
    initials: "SA",
    cert: "Strength · Hypertrophy",
    ptEligible: true,
    weekly_shifts: {
      "Mon": ["07:00", "08:00", "09:00", "10:00", "17:00", "18:00", "19:00", "20:00"],
      "Tue": ["07:00", "08:00", "09:00", "10:00", "17:00", "18:00", "19:00", "20:00"],
      "Wed": ["07:00", "08:00", "09:00", "10:00", "17:00", "18:00", "19:00", "20:00"],
      "Thu": ["07:00", "08:00", "09:00", "10:00", "17:00", "18:00", "19:00", "20:00"],
      "Fri": ["07:00", "08:00", "09:00", "10:00", "17:00", "18:00", "19:00", "20:00"],
      "Sat": ["08:00", "09:00", "10:00", "11:00", "12:00"]
    }
  },
  {
    id: "pilates",
    name: "Anisha",
    role: "Pilates & Mobility",
    tone: "sand",
    bio: "Clinical Pilates for posture correction, core stability, and post-injury returns. Brings precise athletic alignment and core strength focus to every class.",
    specialties: ["Pilates", "Mobility", "Recovery"],
    initials: "AN",
    cert: "Pilates · Mobility",
    ptEligible: false,
    weekly_shifts: {
      "Mon": ["09:00", "10:00", "11:00"],
      "Wed": ["09:00", "10:00", "11:00"],
      "Fri": ["09:00", "10:00", "11:00"]
    }
  },
  {
    id: "shahbaz",
    name: "Shahbaz",
    role: "Yoga & Breathwork",
    tone: "sage",
    bio: "Traditional hatha, vinyasa, and restorative practice. Breath-led routines engineered to develop robust mobility, mental focus, and complete active recovery.",
    specialties: ["Yoga", "Breathwork", "Mobility"],
    initials: "SH",
    cert: "Yoga · Breathwork",
    ptEligible: false,
    weekly_shifts: {
      "Tue": ["07:00", "08:00", "18:00"],
      "Thu": ["07:00", "08:00", "18:00"],
      "Sat": ["08:00", "09:00"]
    }
  },
  {
    id: "shwetambari",
    name: "Shwetambari",
    role: "Founder & Owner",
    tone: "walnut",
    bio: "Pioneering athletic conditioning coach and yoga practitioner. Oversees elite programming, physical evaluations, and functional baseline screening methodologies.",
    specialties: ["Programming", "Evaluation", "Coaching"],
    initials: "SS",
    cert: "Master Athletic Conditioning Coach",
    ptEligible: false,
    weekly_shifts: {
      "Mon": ["08:00", "09:00", "10:00"],
      "Wed": ["08:00", "09:00", "10:00"],
      "Fri": ["08:00", "09:00", "10:00"]
    }
  }
];

async function seed() {
  console.log("Seeding 11 coaches_list matches in Firestore...");
  for (const coach of coaches) {
    const docRef = doc(db, "coaches_list", coach.id);
    await setDoc(docRef, coach, { merge: true });
    console.log(`✓ Seeded metadata of Coach ${coach.name} (${coach.id}) successfully.`);
  }
  console.log("Database seeding completed successfully for all 11 coaches.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Critical error during coach seeding:", err);
  process.exit(1);
});
