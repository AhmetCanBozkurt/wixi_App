import React, { useState, useRef } from 'react';
import { 
  FaPlus, FaColumns, FaListUl, FaChartBar, FaCheckCircle, FaClock, FaFlag 
} from 'react-icons/fa';
import {
  DndContext, 
  DragOverlay, 
  closestCorners, 
  PointerSensor, 
  useSensor, 
  useSensors,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import styles from './ProjectManagementPage.module.css';

// --- TYPES ---
interface Task {
  id: string;
  name: string;
  status: 'todo' | 'inprogress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignees: string[];
  dueDate: string;
  progress: number;
  startDate: number; 
  duration: number;  
}

// --- STATIC TASK UI ---
const TaskCardUI = ({ task, isOverlay = false, isDragging = false }: { task: Task; isOverlay?: boolean; isDragging?: boolean }) => {
  return (
    <div 
      className={`${styles.taskCard} ${isOverlay ? styles.isDraggingOverlay : ''}`} 
      style={{ 
        opacity: isDragging && !isOverlay ? 0.3 : 1,
        margin: isOverlay ? 0 : undefined,
      }}
    >
      <div className={styles.taskTags}>
        <span className={styles.tag} style={{ 
          background: task.priority === 'high' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(37, 99, 235, 0.1)',
          color: task.priority === 'high' ? '#ef4444' : '#3b82f6'
        }}>
          {task.priority}
        </span>
      </div>
      <span className={styles.taskName}>{task.name}</span>
      <div className={styles.taskFooter}>
        <div className={styles.assignees}>
          {task.assignees.map((a, i) => (
            <div key={i} className={styles.avatar}>{a}</div>
          ))}
        </div>
        <div className={styles.taskMeta}>
          <FaClock /> {task.dueDate}
        </div>
      </div>
    </div>
  );
};

// --- DRAGGABLE WRAPPER ---
const DraggableTask = ({ task }: { task: Task }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: task
  });

  return (
    <div ref={setNodeRef} {...listeners} {...attributes}>
      <TaskCardUI task={task} isDragging={isDragging} />
    </div>
  );
};

// --- DROPPABLE COLUMN ---
const KanbanColumn = ({ id, title, color, tasks }: { id: string; title: string; color: string; tasks: Task[] }) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className={`${styles.kanbanColumn} ${isOver ? styles.isOver : ''}`}>
      <div className={styles.columnHeader}>
        <div className={styles.columnTitle}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
          {title}
        </div>
        <span className={styles.taskCount}>{tasks.length}</span>
      </div>
      <div className={styles.taskList} style={{ minHeight: '300px', flex: 1 }}>
        {tasks.map(task => (
          <DraggableTask key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};

// --- MAIN PAGE ---
export const ProjectManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'kanban' | 'list' | 'gantt'>('kanban');
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', name: 'Frontend Tasarımı Geliştirme', status: 'inprogress', priority: 'high', assignees: ['AC', 'MZ'], dueDate: '20 Mayıs', progress: 65, startDate: 2, duration: 5 },
    { id: '2', name: 'API Entegrasyonu', status: 'todo', priority: 'medium', assignees: ['TK'], dueDate: '22 Mayıs', progress: 0, startDate: 8, duration: 4 },
    { id: '3', name: 'Gantt Chart Bileşeni Yazımı', status: 'review', priority: 'high', assignees: ['AC'], dueDate: '18 Mayıs', progress: 90, startDate: 0, duration: 3 },
    { id: '4', name: 'Veritabanı Migrasyonu', status: 'done', priority: 'low', assignees: ['SY'], dueDate: '15 Mayıs', progress: 100, startDate: 1, duration: 2 },
    { id: '5', name: 'Mobil Uyumluluk Testleri', status: 'inprogress', priority: 'medium', assignees: ['MZ', 'TK'], dueDate: '25 Mayıs', progress: 30, startDate: 10, duration: 6 }
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = (event: any) => {
    const task = tasks.find(t => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveTask(null);

    if (over) {
      const newStatus = over.id as Task['status'];
      setTasks(prev => prev.map(t => t.id === active.id ? { ...t, status: newStatus } : t));
    }
  };

  const renderGantt = () => {
    const days = Array.from({ length: 15 }, (_, i) => i + 1);
    return (
      <div className={styles.ganttContainer}>
        <div className={styles.ganttWrapper}>
          <div className={styles.ganttHeader}>
            <div className={styles.ganttSidebarHeader}>Görev Listesi</div>
            <div className={styles.ganttTimeline}>
              {days.map(d => (
                <div key={d} className={styles.dayCell}>{d} Mayıs</div>
              ))}
            </div>
          </div>
          {tasks.map(task => (
            <div key={task.id} className={styles.ganttRow}>
              <div className={styles.ganttTaskInfo}>{task.name}</div>
              <div className={styles.ganttBarsArea}>
                <div 
                  className={styles.ganttBar}
                  style={{ 
                    left: `${task.startDate * 100}px`, 
                    width: `${task.duration * 100}px`,
                    background: task.status === 'done' ? '#10b981' : 'linear-gradient(90deg, var(--color-primary), #6366f1)'
                  }}
                >
                  %{task.progress}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1>Proje Yönetim Merkezi</h1>
          <p>Tüm görünümlerle tam kontrol sağlayın.</p>
        </div>
        <button className={styles.addButton}><FaPlus /> Yeni Görev</button>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#3b82f6' }}><FaChartBar /></div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Toplam</span>
            <span className={styles.statValue}>{tasks.length}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><FaCheckCircle /></div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Tamamlanan</span>
            <span className={styles.statValue}>{tasks.filter(t => t.status === 'done').length}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}><FaFlag /></div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Geciken</span>
            <span className={styles.statValue}>0</span>
          </div>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className={styles.viewSwitcher}>
          <button className={`${styles.viewBtn} ${activeTab === 'kanban' ? styles.active : ''}`} onClick={() => setActiveTab('kanban')}><FaColumns /> Kanban</button>
          <button className={`${styles.viewBtn} ${activeTab === 'gantt' ? styles.active : ''}`} onClick={() => setActiveTab('gantt')}><FaChartBar /> Gantt</button>
          <button className={`${styles.viewBtn} ${activeTab === 'list' ? styles.active : ''}`} onClick={() => setActiveTab('list')}><FaListUl /> Liste</button>
        </div>

        <div className={styles.mainContent}>
          {activeTab === 'kanban' && (
            <div className={styles.kanbanBoard}>
              <KanbanColumn id="todo" title="Yapılacaklar" color="#64748b" tasks={tasks.filter(t => t.status === 'todo')} />
              <KanbanColumn id="inprogress" title="Devam Edenler" color="#3b82f6" tasks={tasks.filter(t => t.status === 'inprogress')} />
              <KanbanColumn id="review" title="İncelemede" color="#f59e0b" tasks={tasks.filter(t => t.status === 'review')} />
              <KanbanColumn id="done" title="Tamamlananlar" color="#10b981" tasks={tasks.filter(t => t.status === 'done')} />
            </div>
          )}
          {activeTab === 'gantt' && renderGantt()}
          {activeTab === 'list' && (
            <div className={styles.listView}>
              <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-main)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)', textAlign: 'left' }}>
                    <th style={{ padding: '16px' }}>Görev Adı</th>
                    <th>Durum</th>
                    <th>Öncelik</th>
                    <th>Sorumlu</th>
                    <th>Teslim Tarihi</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => (
                    <tr key={task.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                      <td style={{ padding: '16px', fontWeight: 600 }}>{task.name}</td>
                      <td><span className={styles.tag} style={{ background: 'rgba(255,255,255,0.05)' }}>{task.status}</span></td>
                      <td><span className={styles.tag} style={{ 
                        background: task.priority === 'high' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(37, 99, 235, 0.1)',
                        color: task.priority === 'high' ? '#ef4444' : '#3b82f6'
                      }}>{task.priority}</span></td>
                      <td>{task.assignees.join(', ')}</td>
                      <td>{task.dueDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCardUI task={activeTask} isOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
