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
    console.log('Opening modal for project:', project.title);
    setSelectedProject(project);
    setCurrentImageIndex(0);
    document.body.style.overflow = 'hidden';
  };

  // Close modal
  const closeModal = () => {
    console.log('Closing modal');
    setSelectedProject(null);
    setCurrentImageIndex(0);
    document.body.style.overflow = 'unset';
  };

  // Navigate images - Fixed version
  const nextImage = (e) => {
    if (e) e.stopPropagation();
    
    if (selectedProject && selectedProject.imageUrls && selectedProject.imageUrls.length > 1) {
      setCurrentImageIndex((prev) => {
        const newIndex = prev === selectedProject.imageUrls.length - 1 ? 0 : prev + 1;
        console.log('Next image - Previous index:', prev, 'New index:', newIndex);
        return newIndex;
      });
    } else {
      console.log('Cannot navigate - no images or only one image');
    }
  };

  const prevImage = (e) => {
    if (e) e.stopPropagation();
    
    if (selectedProject && selectedProject.imageUrls && selectedProject.imageUrls.length > 1) {
      setCurrentImageIndex((prev) => {
        const newIndex = prev === 0 ? selectedProject.imageUrls.length - 1 : prev - 1;
        console.log('Previous image - Previous index:', prev, 'New index:', newIndex);
        return newIndex;
      });
    } else {
      console.log('Cannot navigate - no images or only one image');
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyboard = (e) => {
      if (!selectedProject) return;
      
      console.log('Key pressed:', e.key);
      
      if (e.key === 'Escape') {
        closeModal();
      } else if (e.key === 'ArrowRight') {
        nextImage(null);
      } else if (e.key === 'ArrowLeft') {
        prevImage(null);
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [selectedProject]); // Removed currentImageIndex from dependencies

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

      {/* Projects Count */}
      <div className="projects-count">
        {filteredProjects.length} {filteredProjects.length === 1 ? 'Project' : 'Projects'}
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
                    key={currentImageIndex} // Added key to force re-render
                    src={selectedProject.imageUrls[currentImageIndex]} 
                    alt={`${selectedProject.title} - Image ${currentImageIndex + 1}`} 
                  />
                  {selectedProject.imageUrls.length > 1 && (
                    <>
                      <button 
                        className="modal-nav modal-prev" 
                        onClick={prevImage}
                        aria-label="Previous image"
                      >
                        ←
                      </button>
                      <button 
                        className="modal-nav modal-next" 
                        onClick={nextImage}
                        aria-label="Next image"
                      >
                        →
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;