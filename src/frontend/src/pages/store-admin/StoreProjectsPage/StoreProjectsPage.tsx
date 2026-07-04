import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaClock, FaFlag, FaCheckCircle, FaColumns, FaPlus, FaProjectDiagram, FaTrash, FaComments, FaPlay, FaStop, FaStopwatch } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { Button } from '../../../shared/ui/Button/Button';
import { Input } from '../../../shared/ui/Input/Input';
import { Select } from '../../../shared/ui/Select/Select';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { projectApi } from '../../../entities/Project';
import type { ProjectListDto, ProjectBoardDto, TaskBoardDto, TaskDetailDto, TaskStatus } from '../../../entities/Project';
import { projectMutations, type TaskFormPayload } from '../../../features/ProjectBoard/api/projectMutations';
import styles from './StoreProjectsPage.module.css';

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 0, title: 'Yapılacak', color: '#94a3b8' },
  { id: 1, title: 'Devam Ediyor', color: '#3b82f6' },
  { id: 2, title: 'İncelemede', color: '#f59e0b' },
  { id: 3, title: 'Tamamlandı', color: '#10b981' },
];

const PRIORITY_META: Record<number, { label: string; color: string }> = {
  0: { label: 'Düşük', color: '#94a3b8' },
  1: { label: 'Orta', color: '#3b82f6' },
  2: { label: 'Yüksek', color: '#f59e0b' },
  3: { label: 'Acil', color: '#ef4444' },
};

const PRIORITY_OPTIONS = Object.entries(PRIORITY_META).map(([v, m]) => ({ label: m.label, value: Number(v) }));

const PROJECT_STATUS_OPTIONS = [
  { label: 'Aktif', value: 0 },
  { label: 'Beklemede', value: 1 },
  { label: 'Tamamlandı', value: 2 },
  { label: 'İptal', value: 3 },
];

const initials = (name?: string) =>
  (name ?? '?').split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();

const formatMinutes = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}s ${m}dk` : `${m}dk`;
};

// ── Görev kartı ────────────────────────────────────────────────────────

const TaskCardUI = ({ task, isOverlay = false, isDragging = false }: { task: TaskBoardDto; isOverlay?: boolean; isDragging?: boolean }) => {
  const prio = PRIORITY_META[task.priority] ?? PRIORITY_META[1];
  return (
    <div
      className={`${styles.taskCard} ${isOverlay ? styles.isDraggingOverlay : ''}`}
      style={{ opacity: isDragging && !isOverlay ? 0.3 : 1 }}
    >
      <div className={styles.taskTags}>
        <span className={styles.tag} style={{ background: `${prio.color}1a`, color: prio.color }}>
          {prio.label}
        </span>
        {task.subTaskCount > 0 && (
          <span className={styles.subtaskBadge}>{task.subTaskCount} alt görev</span>
        )}
      </div>
      <span className={styles.taskName}>{task.title}</span>
      {task.progress > 0 && (
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${task.progress}%` }} />
        </div>
      )}
      <div className={styles.taskFooter}>
        <div className={styles.assignees}>
          {task.assignees.slice(0, 3).map((a) => (
            <div key={a.userId} className={styles.avatar} title={a.userName ?? a.userEmail}>
              {initials(a.userName ?? a.userEmail)}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {task.commentCount > 0 && (
            <span className={styles.taskMeta}><FaComments /> {task.commentCount}</span>
          )}
          {task.dueDate && (
            <span className={styles.taskMeta}>
              <FaClock /> {new Date(task.dueDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const DraggableTask = ({ task, onOpen }: { task: TaskBoardDto; onOpen: (task: TaskBoardDto) => void }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id, data: task });
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} onClick={() => !isDragging && onOpen(task)}>
      <TaskCardUI task={task} isDragging={isDragging} />
    </div>
  );
};

const KanbanColumn = ({ id, title, color, tasks, onOpen }: {
  id: TaskStatus; title: string; color: string; tasks: TaskBoardDto[]; onOpen: (task: TaskBoardDto) => void;
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: `col-${id}` });
  return (
    <div ref={setNodeRef} className={`${styles.kanbanColumn} ${isOver ? styles.isOver : ''}`}>
      <div className={styles.columnHeader}>
        <div className={styles.columnTitle}>
          <div className={styles.columnDot} style={{ background: color }} />
          {title}
        </div>
        <span className={styles.taskCount}>{tasks.length}</span>
      </div>
      <div className={styles.taskList}>
        {tasks.map((task) => (
          <DraggableTask key={task.id} task={task} onOpen={onOpen} />
        ))}
      </div>
    </div>
  );
};

// ── Sayfa ──────────────────────────────────────────────────────────────

interface TaskForm {
  title: string;
  description: string;
  priority: number;
  dueDate: string;
  parentTaskId: string | null;
}

const EMPTY_TASK_FORM: TaskForm = { title: '', description: '', priority: 1, dueDate: '', parentTaskId: null };

interface ProjectForm {
  name: string;
  description: string;
  customerName: string;
  status: number;
  endDate: string;
}

const EMPTY_PROJECT_FORM: ProjectForm = { name: '', description: '', customerName: '', status: 0, endDate: '' };

export const StoreProjectsPage = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const [projects, setProjects] = useState<ProjectListDto[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [board, setBoard] = useState<ProjectBoardDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<TaskBoardDto | null>(null);

  // Modallar
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectListDto | null>(null);
  const [projectForm, setProjectForm] = useState<ProjectForm>(EMPTY_PROJECT_FORM);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [confirmDeleteProject, setConfirmDeleteProject] = useState(false);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState<TaskForm>(EMPTY_TASK_FORM);
  const [isSavingTask, setIsSavingTask] = useState(false);

  const [taskDetail, setTaskDetail] = useState<TaskDetailDto | null>(null);
  const [newComment, setNewComment] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const [confirmDeleteTask, setConfirmDeleteTask] = useState(false);

  useEffect(() => {
    if (tenantSlug) localStorage.setItem('wixi-active-tenant', tenantSlug);
  }, [tenantSlug]);

  const fetchProjects = useCallback(async (selectId?: string) => {
    try {
      const list = await projectApi.getProjects();
      setProjects(list);
      if (selectId) {
        setSelectedProjectId(selectId);
      } else if (list.length > 0 && !list.some((p) => p.id === selectedProjectId)) {
        setSelectedProjectId(list[0].id);
      } else if (list.length === 0) {
        setSelectedProjectId('');
        setBoard(null);
      }
    } catch {
      toast.error('Projeler yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId]);

  const fetchBoard = useCallback(async () => {
    if (!selectedProjectId) return;
    try {
      setBoard(await projectApi.getBoard(selectedProjectId));
    } catch {
      toast.error('Pano yüklenemedi.');
    }
  }, [selectedProjectId]);

  useEffect(() => { void fetchProjects(); }, []);          // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { void fetchBoard(); }, [fetchBoard]);

  const tasksByColumn = useMemo(() => {
    const map = new Map<TaskStatus, TaskBoardDto[]>();
    COLUMNS.forEach((c) => map.set(c.id, []));
    // Alt görevler kanbanda ayrı kart olarak gösterilmez — detayda listelenir
    (board?.tasks ?? []).filter((t) => !t.parentTaskId).forEach((t) => {
      map.get(t.status)?.push(t);
    });
    map.forEach((list) => list.sort((a, b) => a.sortOrder - b.sortOrder));
    return map;
  }, [board]);

  const stats = useMemo(() => {
    const all = (board?.tasks ?? []).filter((t) => !t.parentTaskId);
    return {
      total: all.length,
      inProgress: all.filter((t) => t.status === 1).length,
      urgent: all.filter((t) => t.priority === 3 && t.status !== 3).length,
      done: all.filter((t) => t.status === 3).length,
    };
  }, [board]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragStart = (event: DragStartEvent) => {
    const task = board?.tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over || !board) return;

    const overId = String(over.id);
    if (!overId.startsWith('col-')) return;
    const newStatus = Number(overId.replace('col-', '')) as TaskStatus;

    const task = board.tasks.find((t) => t.id === active.id);
    if (!task || task.status === newStatus) return;

    const targetCount = (tasksByColumn.get(newStatus) ?? []).length;
    const prevBoard = board;

    // Optimistic güncelleme
    setBoard({
      ...board,
      tasks: board.tasks.map((t) =>
        t.id === task.id
          ? { ...t, status: newStatus, sortOrder: targetCount, progress: newStatus === 3 ? 100 : t.progress }
          : t),
    });

    try {
      await projectMutations.updateTaskStatus(task.id, newStatus, targetCount);
    } catch {
      toast.error('Durum güncellenemedi.');
      setBoard(prevBoard);
    }
  };

  // ── Proje CRUD ───────────────────────────────────────────────────

  const openCreateProject = () => {
    setEditingProject(null);
    setProjectForm(EMPTY_PROJECT_FORM);
    setIsProjectModalOpen(true);
  };

  const openEditProject = () => {
    const p = projects.find((x) => x.id === selectedProjectId);
    if (!p) return;
    setEditingProject(p);
    setProjectForm({
      name: p.name,
      description: p.description ?? '',
      customerName: p.customerName ?? '',
      status: p.status,
      endDate: p.endDate ? p.endDate.slice(0, 10) : '',
    });
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = async () => {
    if (!projectForm.name.trim()) { toast.error('Proje adı zorunludur.'); return; }
    setIsSavingProject(true);
    try {
      const payload = {
        name: projectForm.name.trim(),
        description: projectForm.description.trim() || null,
        customerName: projectForm.customerName.trim() || null,
        endDate: projectForm.endDate || null,
      };
      if (editingProject) {
        await projectMutations.updateProject(editingProject.id, { ...payload, status: projectForm.status });
        toast.success('Proje güncellendi.');
        await fetchProjects(editingProject.id);
        void fetchBoard();
      } else {
        const created = await projectMutations.createProject(payload);
        toast.success(`Proje oluşturuldu (${created.code}).`);
        await fetchProjects(created.id);
      }
      setIsProjectModalOpen(false);
    } catch {
      toast.error('Proje kaydedilemedi.');
    } finally {
      setIsSavingProject(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProjectId) return;
    try {
      await projectMutations.deleteProject(selectedProjectId);
      toast.success('Proje silindi.');
      setConfirmDeleteProject(false);
      setSelectedProjectId('');
      setBoard(null);
      void fetchProjects();
    } catch {
      toast.error('Proje silinemedi.');
    }
  };

  // ── Görev CRUD ───────────────────────────────────────────────────

  const openCreateTask = (parentTaskId: string | null = null) => {
    setTaskForm({ ...EMPTY_TASK_FORM, parentTaskId });
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async () => {
    if (!selectedProjectId) return;
    if (!taskForm.title.trim()) { toast.error('Görev başlığı zorunludur.'); return; }
    setIsSavingTask(true);
    try {
      const payload: TaskFormPayload = {
        title: taskForm.title.trim(),
        description: taskForm.description.trim() || null,
        parentTaskId: taskForm.parentTaskId,
        priority: taskForm.priority,
        status: 0,
        dueDate: taskForm.dueDate || null,
      };
      await projectMutations.createTask(selectedProjectId, payload);
      toast.success(taskForm.parentTaskId ? 'Alt görev eklendi.' : 'Görev oluşturuldu.');
      setIsTaskModalOpen(false);
      void fetchBoard();
      // Detay açıksa alt görev listesi tazelensin
      if (taskDetail && taskForm.parentTaskId === taskDetail.id) {
        setTaskDetail(await projectApi.getTask(taskDetail.id));
      }
    } catch {
      toast.error('Görev kaydedilemedi.');
    } finally {
      setIsSavingTask(false);
    }
  };

  const openTaskDetail = async (task: TaskBoardDto) => {
    try {
      setTaskDetail(await projectApi.getTask(task.id));
    } catch {
      toast.error('Görev detayı yüklenemedi.');
    }
  };

  const handleAddComment = async () => {
    if (!taskDetail || !newComment.trim()) return;
    try {
      await projectMutations.addComment(taskDetail.id, newComment.trim());
      setNewComment('');
      setTaskDetail(await projectApi.getTask(taskDetail.id));
      void fetchBoard();
    } catch {
      toast.error('Yorum eklenemedi.');
    }
  };

  const handleAddSubtask = async () => {
    if (!taskDetail || !selectedProjectId || !newSubtask.trim()) return;
    try {
      await projectMutations.createTask(selectedProjectId, {
        title: newSubtask.trim(),
        parentTaskId: taskDetail.id,
        priority: 1,
        status: 0,
      });
      setNewSubtask('');
      setTaskDetail(await projectApi.getTask(taskDetail.id));
      void fetchBoard();
    } catch {
      toast.error('Alt görev eklenemedi.');
    }
  };

  const handleToggleTimer = async () => {
    if (!taskDetail) return;
    const running = taskDetail.timeEntries.some((e) => !e.endedAt);
    try {
      if (running) {
        await projectMutations.stopTime(taskDetail.id);
        toast.success('Sayaç durduruldu.');
      } else {
        await projectMutations.startTime(taskDetail.id);
        toast.success('Sayaç başlatıldı.');
      }
      setTaskDetail(await projectApi.getTask(taskDetail.id));
    } catch {
      toast.error(running ? 'Sayaç durdurulamadı.' : 'Sayaç başlatılamadı.');
    }
  };

  const handleDeleteTask = async () => {
    if (!taskDetail) return;
    try {
      await projectMutations.deleteTask(taskDetail.id);
      toast.success('Görev silindi.');
      setConfirmDeleteTask(false);
      setTaskDetail(null);
      void fetchBoard();
    } catch {
      toast.error('Görev silinemedi.');
    }
  };

  const projectOptions = projects.map((p) => ({ label: `${p.code} — ${p.name}`, value: p.id }));

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h2><FaProjectDiagram style={{ marginRight: 8, verticalAlign: -2 }} />Proje Yönetimi</h2>
          <p>{board?.customerName ? `Müşteri: ${board.customerName}` : 'Projeler, görevler ve kanban panosu'}</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.projectSelect}>
            <Select
              options={projectOptions.length ? projectOptions : [{ label: '— Proje yok —', value: '' }]}
              value={selectedProjectId}
              onChange={(v) => setSelectedProjectId(String(v))}
            />
          </div>
          {selectedProjectId && (
            <>
              <Button variant="ghost" onClick={openEditProject}>Düzenle</Button>
              <Button variant="ghost" onClick={() => setConfirmDeleteProject(true)}><FaTrash /></Button>
              <Button variant="primary" leftIcon={<FaPlus />} onClick={() => openCreateTask()}>Yeni Görev</Button>
            </>
          )}
          <Button variant="secondary" leftIcon={<FaPlus />} onClick={openCreateProject}>Yeni Proje</Button>
        </div>
      </div>

      {isLoading ? (
        <p className={styles.emptyState}>Yükleniyor…</p>
      ) : projects.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Henüz proje yok. İlk projenizi oluşturun.</p>
          <Button variant="primary" leftIcon={<FaPlus />} onClick={openCreateProject}>Yeni Proje</Button>
        </div>
      ) : (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}><FaColumns /></div>
              <div><div className={styles.statLabel}>Toplam Görev</div><div className={styles.statValue}>{stats.total}</div></div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}><FaClock /></div>
              <div><div className={styles.statLabel}>Devam Eden</div><div className={styles.statValue}>{stats.inProgress}</div></div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}><FaFlag /></div>
              <div><div className={styles.statLabel}>Acil</div><div className={styles.statValue}>{stats.urgent}</div></div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}><FaCheckCircle /></div>
              <div><div className={styles.statLabel}>Tamamlanan</div><div className={styles.statValue}>{stats.done}</div></div>
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={(e) => void handleDragEnd(e)}
          >
            <div className={styles.kanbanBoard}>
              {COLUMNS.map((col) => (
                <KanbanColumn
                  key={col.id}
                  id={col.id}
                  title={col.title}
                  color={col.color}
                  tasks={tasksByColumn.get(col.id) ?? []}
                  onOpen={(t) => void openTaskDetail(t)}
                />
              ))}
            </div>
            <DragOverlay>
              {activeTask && <TaskCardUI task={activeTask} isOverlay />}
            </DragOverlay>
          </DndContext>
        </>
      )}

      {/* Proje modalı */}
      <Modal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        title={editingProject ? 'Projeyi Düzenle' : 'Yeni Proje'}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsProjectModalOpen(false)}>İptal</Button>
            <Button variant="primary" isLoading={isSavingProject} onClick={() => void handleSaveProject()}>Kaydet</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <Input
            label="Proje Adı *"
            value={projectForm.name}
            onChange={(e) => setProjectForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Ör: Web sitesi yenileme"
          />
          <Input
            label="Müşteri / Cari Adı"
            value={projectForm.customerName}
            onChange={(e) => setProjectForm((f) => ({ ...f, customerName: e.target.value }))}
            placeholder="Projenin bağlı olduğu müşteri"
          />
          <Input
            label="Bitiş Tarihi"
            type="date"
            value={projectForm.endDate}
            onChange={(e) => setProjectForm((f) => ({ ...f, endDate: e.target.value }))}
          />
          {editingProject && (
            <Select
              label="Durum"
              options={PROJECT_STATUS_OPTIONS}
              value={projectForm.status}
              onChange={(v) => setProjectForm((f) => ({ ...f, status: Number(v) }))}
            />
          )}
          <Input
            label="Açıklama"
            value={projectForm.description}
            onChange={(e) => setProjectForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Kısa açıklama"
          />
        </div>
      </Modal>

      {/* Proje silme onayı */}
      <Modal
        isOpen={confirmDeleteProject}
        onClose={() => setConfirmDeleteProject(false)}
        title="Projeyi Sil"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDeleteProject(false)}>Vazgeç</Button>
            <Button variant="danger" onClick={() => void handleDeleteProject()}>Evet, Sil</Button>
          </>
        }
      >
        <p>Proje ve tüm görevleri silinecek. Emin misiniz?</p>
      </Modal>

      {/* Görev modalı */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title={taskForm.parentTaskId ? 'Yeni Alt Görev' : 'Yeni Görev'}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsTaskModalOpen(false)}>İptal</Button>
            <Button variant="primary" isLoading={isSavingTask} onClick={() => void handleSaveTask()}>Kaydet</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <Input
            label="Başlık *"
            value={taskForm.title}
            onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Görev başlığı"
          />
          <Select
            label="Öncelik"
            options={PRIORITY_OPTIONS}
            value={taskForm.priority}
            onChange={(v) => setTaskForm((f) => ({ ...f, priority: Number(v) }))}
          />
          <Input
            label="Termin Tarihi"
            type="date"
            value={taskForm.dueDate}
            onChange={(e) => setTaskForm((f) => ({ ...f, dueDate: e.target.value }))}
          />
          <Input
            label="Açıklama"
            value={taskForm.description}
            onChange={(e) => setTaskForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Görev detayı"
          />
        </div>
      </Modal>

      {/* Görev detay modalı */}
      <Modal
        isOpen={!!taskDetail}
        onClose={() => setTaskDetail(null)}
        title={taskDetail?.title ?? 'Görev'}
        size="lg"
        footer={
          <>
            <Button variant="danger" onClick={() => setConfirmDeleteTask(true)}>Görevi Sil</Button>
            <Button variant="ghost" onClick={() => setTaskDetail(null)}>Kapat</Button>
          </>
        }
      >
        {taskDetail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <span className={styles.tag} style={{ background: `${PRIORITY_META[taskDetail.priority].color}1a`, color: PRIORITY_META[taskDetail.priority].color }}>
                {PRIORITY_META[taskDetail.priority].label}
              </span>
              <span className={styles.tag} style={{ background: `${COLUMNS[taskDetail.status].color}1a`, color: COLUMNS[taskDetail.status].color }}>
                {COLUMNS[taskDetail.status].title}
              </span>
              {taskDetail.dueDate && (
                <span className={styles.taskMeta}><FaClock /> {new Date(taskDetail.dueDate).toLocaleDateString('tr-TR')}</span>
              )}
              <span className={styles.taskMeta}>İlerleme: %{taskDetail.progress}</span>
            </div>

            {taskDetail.description && <p style={{ margin: 0, fontSize: '0.88rem' }}>{taskDetail.description}</p>}

            {/* Zaman takibi */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h4 style={{ margin: 0, fontSize: '0.85rem' }}>
                  <FaStopwatch style={{ marginRight: 6, verticalAlign: -2 }} />
                  Zaman Takibi — Toplam: {formatMinutes(taskDetail.totalTrackedMinutes)}
                </h4>
                {(() => {
                  const running = taskDetail.timeEntries.some((e) => !e.endedAt);
                  return (
                    <Button
                      variant={running ? 'danger' : 'success'}
                      size="sm"
                      leftIcon={running ? <FaStop /> : <FaPlay />}
                      onClick={() => void handleToggleTimer()}
                    >
                      {running ? 'Durdur' : 'Başlat'}
                    </Button>
                  );
                })()}
              </div>
              {taskDetail.timeEntries.length > 0 && (
                <div className={styles.commentList} style={{ maxHeight: 140 }}>
                  {taskDetail.timeEntries.map((e) => (
                    <div key={e.id} className={styles.commentItem} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <span>
                        {e.userName ?? '—'}
                        {!e.endedAt && (
                          <span style={{ marginLeft: 6, color: '#10b981', fontWeight: 700, fontSize: '0.72rem' }}>● çalışıyor</span>
                        )}
                        {e.note && <span style={{ color: 'var(--text-muted)' }}> · {e.note}</span>}
                      </span>
                      <span style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                        {new Date(e.startedAt).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        {e.endedAt ? ` · ${formatMinutes(e.durationMinutes)}` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Alt görevler */}
            {!taskDetail.parentTaskId && (
              <div>
                <h4 style={{ margin: '0 0 8px', fontSize: '0.85rem' }}>Alt Görevler ({taskDetail.subTasks.length})</h4>
                {taskDetail.subTasks.map((st) => (
                  <div key={st.id} className={styles.subTaskRow}>
                    <span>{st.title}</span>
                    <span className={styles.tag} style={{ background: `${COLUMNS[st.status].color}1a`, color: COLUMNS[st.status].color }}>
                      {COLUMNS[st.status].title}
                    </span>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <Input
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    placeholder="Yeni alt görev…"
                    onKeyDown={(e) => e.key === 'Enter' && void handleAddSubtask()}
                  />
                  <Button variant="secondary" onClick={() => void handleAddSubtask()}>Ekle</Button>
                </div>
              </div>
            )}

            {/* Yorumlar & aktivite */}
            <div>
              <h4 style={{ margin: '0 0 8px', fontSize: '0.85rem' }}>Yorumlar & Aktivite</h4>
              <div className={styles.commentList}>
                {taskDetail.comments.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Henüz yorum yok.</p>}
                {taskDetail.comments.map((c) => (
                  <div key={c.id} className={`${styles.commentItem} ${c.isSystemLog ? styles.systemLog : ''}`}>
                    <div className={styles.commentMeta}>
                      <span>{c.isSystemLog ? 'Sistem' : (c.authorName ?? '—')}</span>
                      <span>{new Date(c.createdAt).toLocaleString('tr-TR')}</span>
                    </div>
                    {c.content}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Yorum yaz…"
                  onKeyDown={(e) => e.key === 'Enter' && void handleAddComment()}
                />
                <Button variant="primary" onClick={() => void handleAddComment()}>Gönder</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Görev silme onayı */}
      <Modal
        isOpen={confirmDeleteTask}
        onClose={() => setConfirmDeleteTask(false)}
        title="Görevi Sil"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDeleteTask(false)}>Vazgeç</Button>
            <Button variant="danger" onClick={() => void handleDeleteTask()}>Evet, Sil</Button>
          </>
        }
      >
        <p>Görev ve alt görevleri silinecek. Emin misiniz?</p>
      </Modal>
    </div>
  );
};
