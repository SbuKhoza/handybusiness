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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imageOrientations, setImageOrientations] = useState({});

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
      
      // Detect image orientations for masonry layout
      projectsData.forEach(project => {
        if (project.imageUrls && project.imageUrls[0]) {
          const img = new Image();
          img.onload = () => {
            setImageOrientations(prev => ({
              ...prev,
              [project.id]: img.width > img.height ? 'landscape' : 
                           img.width < img.height ? 'portrait' : 'square'
            }));
          };
          img.src = project.imageUrls[0];
        }
      });
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [tenantId]);

  // Sort projects whenever sort changes or projects change
  useEffect(() => {
    const sorted = [...projects].sort((a, b) => {
      switch (currentSort) {
        case 'date-desc':
          return (b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0)) - 
                 (a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0));
        case 'date-asc':
          return (a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0)) - 
                 (b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0));
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
    setCurrentImageIndex(0);
    document.body.style.overflow = 'hidden';
  };

  // Close modal
  const closeModal = () => {
    setSelectedProject(null);
    setCurrentImageIndex(0);
    document.body.style.overflow = 'unset';
  };

  // Navigate images
  const nextImage = (e) => {
    e.stopPropagation();
    if (selectedProject && selectedProject.imageUrls) {
      setCurrentImageIndex((prev) => 
        prev === selectedProject.imageUrls.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (selectedProject && selectedProject.imageUrls) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedProject.imageUrls.length - 1 : prev - 1
      );
    }
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
        <div className={`projects-grid ${gallerySettings.displayStyle === 'masonry' ? 'masonry-style' : 'square-style'}`}>
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className={`project-item ${gallerySettings.displayStyle === 'masonry' ? imageOrientations[project.id] || 'square' : ''}`}
              onClick={() => openModal(project)}
            >
              <div className="project-image-wrapper">
                <img
                  src={project.imageUrls && project.imageUrls[0] ? project.imageUrls[0] : 'https://via.placeholder.com/400'}
                  alt={project.title}
                  className="project-image"
                />
                {project.imageUrls && project.imageUrls.length > 1 && (
                  <div className="image-count-badge">
                    {project.imageUrls.length} photos
                  </div>
                )}
                <div className="project-overlay">
                  <h3>{project.title}</h3>
                  <p className="project-date">
                    {project.createdAt?.toDate ? 
                      project.createdAt.toDate().toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'
                    }
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
              {selectedProject.imageUrls && selectedProject.imageUrls.length > 0 ? (
                <>
                  <img 
                    src={selectedProject.imageUrls[currentImageIndex]} 
                    alt={`${selectedProject.title} - Image ${currentImageIndex + 1}`} 
                  />
                  {selectedProject.imageUrls.length > 1 && (
                    <>
                      <button className="modal-nav modal-prev" onClick={prevImage}>
                        ‹
                      </button>
                      <button className="modal-nav modal-next" onClick={nextImage}>
                        ›
                      </button>
                      <div className="modal-image-counter">
                        {currentImageIndex + 1} / {selectedProject.imageUrls.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
                  No images available
                </div>
              )}
            </div>
            <div className="modal-info">
              <h2>{selectedProject.title}</h2>
              <p className="modal-date">
                {selectedProject.createdAt?.toDate ? 
                  selectedProject.createdAt.toDate().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'
                }
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