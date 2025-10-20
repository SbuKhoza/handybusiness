import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { db } from '../firebase/config';
import { doc, getDoc, collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import './Projects.css';

function Projects() {
  const { tenantId } = useSelector((state) => state.tenant);
  
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [gallerySettings, setGallerySettings] = useState({
    displayStyle: 'square',
    defaultSort: 'date-desc'
  });
  const [currentSort, setCurrentSort] = useState('date-desc');
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load gallery settings
  useEffect(() => {
    if (!tenantId) return;

    const loadSettings = async () => {
      try {
        const settingsRef = doc(db, "tenants", tenantId, "data", "gallerySettings");
        const settingsSnap = await getDoc(settingsRef);
        
        if (settingsSnap.exists()) {
          const settings = settingsSnap.data();
          setGallerySettings(settings);
          setCurrentSort(settings.defaultSort);
        }
      } catch (err) {
        console.error("Error loading gallery settings:", err);
      }
    };

    loadSettings();
  }, [tenantId]);

  // Load projects
  useEffect(() => {
    if (!tenantId) return;

    setLoading(true);
    const projectsRef = collection(db, "tenants", tenantId, "projects");
    const q = query(projectsRef, orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjects(projectsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [tenantId]);

  // Sort projects whenever sort changes or projects change
  useEffect(() => {
    const sorted = [...projects].sort((a, b) => {
      switch (currentSort) {
        case 'date-desc':
          return new Date(b.date) - new Date(a.date);
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
    setFilteredProjects(sorted);
  }, [projects, currentSort]);

  // Open modal
  const openModal = (project) => {
    setSelectedProject(project);
    document.body.style.overflow = 'hidden';
  };

  // Close modal
  const closeModal = () => {
    setSelectedProject(null);
    document.body.style.overflow = 'unset';
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') closeModal();
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  if (loading) {
    return (
      <div className="projects-container">
        <div className="projects-loading">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="projects-container">
      <div className="projects-header">
        <h1>Our Projects</h1>
        <p className="projects-subtitle">
          Explore our portfolio of completed work
        </p>
      </div>

      {/* Sort Controls */}
      <div className="projects-controls">
        <div className="sort-control">
          <label htmlFor="sort-select">Sort by:</label>
          <select
            id="sort-select"
            value={currentSort}
            onChange={(e) => setCurrentSort(e.target.value)}
            className="sort-select"
          >
            <option value="date-desc">Date (Newest First)</option>
            <option value="date-asc">Date (Oldest First)</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
          </select>
        </div>
        <div className="projects-count">
          {filteredProjects.length} {filteredProjects.length === 1 ? 'Project' : 'Projects'}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="no-projects">
          <p>No projects available at the moment.</p>
        </div>
      ) : (
        <div className={`projects-grid ${gallerySettings.displayStyle === 'portrait' ? 'portrait-style' : 'square-style'}`}>
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="project-item"
              onClick={() => openModal(project)}
            >
              <div className="project-image-wrapper">
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="project-image"
                />
                <div className="project-overlay">
                  <h3>{project.title}</h3>
                  <p className="project-date">
                    {new Date(project.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedProject && (
        <div className="project-modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              ×
            </button>
            <div className="modal-image">
              <img src={selectedProject.imageUrl} alt={selectedProject.title} />
            </div>
            <div className="modal-info">
              <h2>{selectedProject.title}</h2>
              <p className="modal-date">
                {new Date(selectedProject.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              {selectedProject.description && (
                <p className="modal-description">{selectedProject.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;