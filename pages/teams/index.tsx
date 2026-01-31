import { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Users,
    Plus,
    Settings,
    LogOut,
    MoreVertical,
    Crown,
    ChevronRight,
    Loader2,
    Building2
} from 'lucide-react';
import styles from '@/styles/teams.module.scss';
import { teamService } from '@/services/team-service';
import { useAlert } from '@/context/alert-context';
import { useConfirm } from '@/context/confirm-context';
import { ThemeToggle } from '@/context/theme-context';
import { Team } from '@/types/team';
import Api from '@/api';
import { CreateTeamModal } from '@/components/Team/CreateTeamModal';

export default function TeamsPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { showAlert } = useAlert();
    const { confirm } = useConfirm();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['teams'],
        queryFn: teamService.getTeams
    });

    const teams = data?.teams || [];

    const handleTeamClick = (team: Team) => {
        router.push(`/team/${team.id}`);
    };

    const handleLogout = async () => {
        const confirmLogout = await confirm({
            message: 'Are you sure you want to log out?',
            title: 'Logout Confirmation',
            confirmText: 'Log out',
            cancelText: 'Cancel'
        });

        if (confirmLogout) {
            const response = await Api.logout();
            queryClient.clear();

            if (response.status === 200) {
                router.push('/');
            }
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleGroup}>
                    <h1>
                        <Building2 size={28} />
                        Your Teams
                    </h1>
                    <p>Manage and collaborate with your teams</p>
                </div>

                <div className={styles.controls}>
                    <button
                        className={styles.createBtn}
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <Plus size={18} />
                        Create Team
                    </button>
                    <button
                        className={styles.serversBtn}
                        onClick={() => router.push('/servers')}
                    >
                        Servers
                    </button>
                    <button onClick={handleLogout} className={styles.logoffBtn}>
                        <LogOut size={18} /> <span>Log out</span>
                    </button>
                    <ThemeToggle className={styles.themeToggle} />
                </div>
            </header>

            {isLoading ? (
                <div className={styles.loading}>
                    <Loader2 size={32} className={styles.spinner} />
                    <span>Loading teams...</span>
                </div>
            ) : teams.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                        <Users size={48} />
                    </div>
                    <h2>No teams yet</h2>
                    <p>Create your first team to start collaborating with others.</p>
                    <button
                        className={styles.createFirstBtn}
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <Plus size={18} />
                        Create Your First Team
                    </button>
                </div>
            ) : (
                <div className={styles.grid}>
                    {teams.map((team) => (
                        <div
                            key={team.id}
                            className={styles.teamCard}
                            onClick={() => handleTeamClick(team)}
                        >
                            <div className={styles.cardHeader}>
                                <div className={styles.teamAvatar}>
                                    {team.avatarUrl ? (
                                        <img src={team.avatarUrl} alt={team.name} />
                                    ) : (
                                        <Users size={24} />
                                    )}
                                </div>
                                <div className={styles.teamInfo}>
                                    <h3>{team.name}</h3>
                                    {team.description && (
                                        <p>{team.description}</p>
                                    )}
                                </div>
                            </div>

                            <div className={styles.cardStats}>
                                <div className={styles.stat}>
                                    <Users size={14} />
                                    <span>{team.memberCount || 1} members</span>
                                </div>
                                <div className={styles.stat}>
                                    <Building2 size={14} />
                                    <span>{team.serverCount || 0} servers</span>
                                </div>
                            </div>

                            <div className={styles.cardFooter}>
                                <span className={styles.viewTeam}>
                                    View Team <ChevronRight size={16} />
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <CreateTeamModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
}
