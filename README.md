# Vision Document: Web-Based Adaptive Learning System with Attention Monitoring

## 1. Project Name & Overview
**Project Name:** Web-Based Adaptive Learning System with Attention Monitoring for School Students

**Overview:**
[cite_start]This project is a web-based application designed to support school students by providing personalized explanations and monitoring engagement during study sessions[cite: 39, 45]. [cite_start]Unlike standard video lectures, this system dynamically generates content suitable for the student's standard and adapts explanations based on their performance and real-time attention levels[cite: 58, 59]. The system bridges the gap between passive learning and active, guided self-study.

## 2. Problem it Solves
* [cite_start]**Lack of Engagement Monitoring:** Current e-learning systems cannot actively monitor if a student is attentive, leading to unproductive study hours and "zoning out" during video classes[cite: 47, 48].
* [cite_start]**One-Size-Fits-All Content:** Students often encounter explanations that are either too difficult or too easy because teaching styles are not personalized to their grade level or learning speed[cite: 41, 49].
* [cite_start]**Lack of Insight:** Teachers and parents currently have very little knowledge about a student's self-study progress or their actual focus levels during study time[cite: 50].

## 3. Target Users (Personas)
* **Primary User (Students):** School students from different standards who require revision, reinforcement, or alternative explanations for school exams. [cite_start]They need a system that adapts to their pace[cite: 66, 67].
* [cite_start]**Secondary User (Parents & Teachers):** Guardians and educators who need access to learning progress reports and session summaries to understand where the student is struggling[cite: 82, 92].

## 4. Vision Statement
[cite_start]To develop a well-organized learning system that supports students with personalized explanations while simultaneously monitoring student engagement to ensure focused and effective self-study[cite: 45, 61].

## 5. Key Features / Goals
* [cite_start]**Standard & Topic Selection:** Allows students to select their specific school standard (e.g., primary, secondary) and syllabus-based topics[cite: 71].
* **Attention Monitoring (Computer Vision):** Uses webcam-based face and presence detection to ensure student engagement during sessions. [cite_start]If the student looks away or leaves, the system pauses or alerts[cite: 72].
* [cite_start]**Adaptive Content Generation:** Dynamically generates learning content (text/visuals) and adapts re-teaching methods when poor performance or distraction is detected[cite: 73, 76].
* [cite_start]**Voice-Based Explanations:** Provides audio explanations alongside visual materials to cater to auditory learners[cite: 74].
* [cite_start]**Assessment & Tracking:** Includes periodic quizzes to assess understanding and tracks progress across different subjects[cite: 75, 77].

## 6. Technology Stack
*(Proposed stack based on project requirements)*

* [cite_start]**Frontend:** React.js / HTML5, CSS3 (For a responsive web interface) [cite: 69]
* [cite_start]**Backend:** Python (Flask/Django) (Required for handling ML logic and request processing) [cite: 116]
* [cite_start]**AI/ML Module:** OpenCV & MediaPipe (For real-time face detection and attention tracking) [cite: 72]
* [cite_start]**Database:** SQL (MySQL/PostgreSQL) (For storing user profiles, progress, and session data) [cite: 119]
* [cite_start]**Deployment:** Docker (For containerization) [cite: 13]

## 7. Success Metrics
* [cite_start]**Engagement Detection:** The system successfully detects student presence and basic attention using the webcam with >85% accuracy[cite: 56].
* [cite_start]**Adaptive Response:** Learning content successfully changes format or difficulty based on real-time engagement and quiz results[cite: 100].
* [cite_start]**Improved Outcomes:** Students demonstrate improved understanding through assessments after using the adaptive explanations[cite: 100].
* [cite_start]**Performance:** The system runs smoothly in a standard browser without significant lag during video processing[cite: 101].

## 8. Assumptions & Constraints
**Assumptions:**
* [cite_start]Students have access to a device with a webcam and stable internet connectivity[cite: 104].
* [cite_start]Students and parents consent to webcam-based monitoring for educational purposes[cite: 105].
* [cite_start]School syllabus content can be modularized effectively by standard and subject[cite: 106].

**Constraints:**
* [cite_start]**Hardware:** A webcam is strictly required for the attention monitoring module to function[cite: 85].
* [cite_start]**Accuracy:** Attention tracking is approximate and cannot fully measure deep cognitive understanding[cite: 86].
* [cite_start]**Privacy:** Continuous video storage is limited or disabled due to privacy considerations; only processed metrics are stored[cite: 88].

## 9. Future Roadmap (Optional Features)
* [cite_start]**Difficulty Level Selection:** allowing students to manually override adaptive settings[cite: 79].
* [cite_start]**Attention Score:** Generating a "Focus Score" per session for gamification[cite: 80].
* [cite_start]**Parental Dashboard:** A dedicated login for parents to view detailed session summaries[cite: 82].
* [cite_start]**Topic Recommendations:** AI-driven suggestions based on past weak areas[cite: 83].

---

## Quick Start – Local Development

### Prerequisites
* Docker Desktop installed
* Git installed

