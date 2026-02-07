import './Trainers.css';


import hero1 from '../assets/heroImg/home7.avif';
import hero2 from '../assets/heroImg/home7.avif';
import hero3 from '../assets/heroImg/home7.avif';
import hero4 from '../assets/heroImg/home7.avif';

const trainers = [
  {
    name: 'Chandan kumar Das',
    role: 'Fitness Instructor',
    img: hero1,
    socials: {
      facebook: '#',
      twitter: '#',
      instagram: '#',
      linkedin: '#',
    },
    message: 'Let’s achieve your fitness goals together!'
  },
  {
    name: 'Rohan Das',
    role: 'CrossFit Expert, Nutrition',
    img: hero2,
    socials: {
      facebook: '#',
      twitter: '#',
      instagram: '#',
      linkedin: '#',
    },
    message: 'Push your limits, see the results!'
  },
  {
    name: 'Leo Das',
    role: 'Nutrition Specialized',
    img: hero3,
    socials: {
      facebook: '#',
      twitter: '#',
      instagram: '#',
      linkedin: '#',
    },
    message: 'Eat well, train hard, live better!'
  },
  {
    name: 'Jailer Das',
    role: 'Strength & Core',
    img: hero4,
    socials: {
      facebook: '#',
      twitter: '#',
      instagram: '#',
      linkedin: '#',
    },
    message: 'Strength comes from within!'
  },
];


function Trainers() {
  return (
    <section className="trainers-section" id="trainers">
      <div className="trainers-container">
        <div className="trainers-header">
          <span className="section-tag">Our Trainers</span>
          <h2 className="trainers-title">
            Meet Our <span className="highlight">Trainers</span>
          </h2>
          <p className="trainers-subtitle">Expertise. Passion. Results. Our certified trainers are here to guide and motivate you every step of the way.</p>
        </div>
        <div className="trainers-list">
          {trainers.map((trainer, idx) => (
            <div
              className="trainer-card fade-in-up"
              key={idx}
              style={{ animationDelay: `${0.2 + idx * 0.15}s` }}
            >
              <div className="card-inner">
                <div className="card-front">
                  <div
                    className="trainer-img-full"
                    style={{ backgroundImage: `url(${trainer.img})` }}
                    onMouseEnter={e => {
                      e.currentTarget.closest('.trainer-card').classList.add('flipped');
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.closest('.trainer-card').classList.remove('flipped');
                    }}
                  ></div>
                  <div className="trainer-info">
                    <h4 className="trainer-name">{trainer.name}</h4>
                    <p className="trainer-role">{trainer.role}</p>
                    <div className="trainer-socials">
                      <a href={trainer.socials.facebook} target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></a>
                      <a href={trainer.socials.twitter} target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter"></i></a>
                      <a href={trainer.socials.instagram} target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
                      <a href={trainer.socials.linkedin} target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin-in"></i></a>
                    </div>
                  </div>
                </div>
                <div className="card-back">
                  <p>{trainer.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Trainers;
