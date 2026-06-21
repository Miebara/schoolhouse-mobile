import { create } from 'zustand';

interface RegistrationState {
  // Admin flow
  adminData: Record<string, string>;
  setAdminData: (data: Record<string, string>) => void;

  // Parent flow
  parentData: Record<string, any>;
  setParentData: (data: Record<string, any>) => void;

  // Teacher flow
  teacherData: Record<string, any>;
  setTeacherData: (data: Record<string, any>) => void;

  // Shared: selected school
  selectedSchool: { id: string; name: string; address: string; logo?: string } | null;
  setSelectedSchool: (school: any) => void;

  // Reset
  reset: () => void;
}

export const useRegistrationStore = create<RegistrationState>((set) => ({
  adminData: {},
  parentData: {},
  teacherData: {},
  selectedSchool: null,

  setAdminData: (data) => set((s) => ({ adminData: { ...s.adminData, ...data } })),
  setParentData: (data) => set((s) => ({ parentData: { ...s.parentData, ...data } })),
  setTeacherData: (data) => set((s) => ({ teacherData: { ...s.teacherData, ...data } })),
  setSelectedSchool: (school) => set({ selectedSchool: school }),
  reset: () => set({ adminData: {}, parentData: {}, teacherData: {}, selectedSchool: null }),
}));
