
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. File categories
export type Category =
  | 'Documents'
  | 'Images'
  | 'Videos'
  | 'Archives'
  | 'Audio';

// 2. File information
export type FileItem = {
  id: string;
  name: string;
  category: Category;
  sizeMB: number;
  added: string;
  expiresAt: number;
  uri?: string;
  notifyBefore?: boolean;
  autoDelete?: boolean;
};

const DAY = 86400000;

// 3. Local storage key
const STORAGE_KEY = '@tempbox_files_v1';

// 4. Original sample files
const sampleFiles: FileItem[] = [
  {
    id: '1',
    name: 'Econ_Lecture_Slide_Deck.pdf',
    category: 'Documents',
    sizeMB: 18.4,
    added: 'Sep 18',
    expiresAt: Date.now() + 8 * 3600000,
  },
  {
    id: '2',
    name: 'Chem_Lab_Whiteboard_Snap.jpg',
    category: 'Images',
    sizeMB: 3.2,
    added: 'Sep 19',
    expiresAt: Date.now() + 2 * DAY,
  },
  {
    id: '3',
    name: 'CS102_HW3_Submission.zip',
    category: 'Archives',
    sizeMB: 45.1,
    added: 'Sep 15',
    expiresAt: Date.now() + 5 * DAY,
  },
  {
    id: '4',
    name: 'Biology_FieldTrip_Record.mp4',
    category: 'Videos',
    sizeMB: 142,
    added: 'Sep 12',
    expiresAt: Date.now() + 12 * DAY,
  },
  {
    id: '5',
    name: 'Rental_Agreement_Temp_Scan.pdf',
    category: 'Documents',
    sizeMB: 2.6,
    added: 'Sep 10',
    expiresAt: Date.now() + 18 * DAY,
  },
  {
    id: '6',
    name: 'Party_Flyer_Draft.png',
    category: 'Images',
    sizeMB: 1.4,
    added: 'Sep 21',
    expiresAt: Date.now() + 6 * 3600000,
  },
  {
    id: '7',
    name: 'Lecture_Audio_Notes.m4a',
    category: 'Audio',
    sizeMB: 12.8,
    added: 'Sep 20',
    expiresAt: Date.now() + 4 * DAY,
  },
];

// 5. Shared context functions
type Store = {
  files: FileItem[];
  addFile: (file: Omit<FileItem, 'id' | 'added'>) => void;
  removeFiles: (ids: string[]) => void;
  extendFiles: (ids: string[], days: number) => void;
};

const Context = createContext<Store | null>(null);

// 6. FilesProvider
export function FilesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [files, setFiles] = useState<FileItem[]>(sampleFiles);

  // Wait until stored files are loaded
  const [isLoaded, setIsLoaded] = useState(false);

  // 7. Load saved files when the app starts
  useEffect(() => {
    let active = true;

    async function loadFiles() {
      try {
        const savedFiles = await AsyncStorage.getItem(STORAGE_KEY);

        if (!active) return;

        if (savedFiles !== null) {
          const parsed = JSON.parse(savedFiles);

          if (!Array.isArray(parsed)) {
            throw new Error('Saved files are not an array');
          }

          setFiles(parsed as FileItem[]);
        }

        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading TempBox files:', error);
        // Do not overwrite saved data if loading fails.
      }
    }

    loadFiles();

    return () => {
      active = false;
    };
  }, []);

  // 8. Automatically save whenever files change
  useEffect(() => {
    if (!isLoaded) return;

    async function saveFiles() {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(files)
        );
      } catch (error) {
        console.error('Error saving TempBox files:', error);
      }
    }

    saveFiles();
  }, [files, isLoaded]);

  // 9. Add a file
  const addFile: Store['addFile'] = file => {
    if (!isLoaded) return;

    setFiles(old => [
      {
        ...file,
        id: `${Date.now()}-${Math.random()}`,
        added: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
      },
      ...old,
    ]);
  };

  // 10. Remove selected files
  const removeFiles: Store['removeFiles'] = ids => {
    if (!isLoaded) return;

    setFiles(old =>
      old.filter(file => !ids.includes(file.id))
    );
  };

  // 11. Extend expiration dates
  const extendFiles: Store['extendFiles'] = (ids, days) => {
    if (!isLoaded) return;

    setFiles(old =>
      old.map(file =>
        ids.includes(file.id)
          ? {
              ...file,
              expiresAt: file.expiresAt + days * DAY,
            }
          : file
      )
    );
  };

  // Wait for saved data before displaying the screens
  if (!isLoaded) {
    return null;
  }

  return (
    <Context.Provider
      value={{
        files,
        addFile,
        removeFiles,
        extendFiles,
      }}
    >
      {children}
    </Context.Provider>
  );
}

// 12. Hook used by other screens
export function useFiles() {
  const value = useContext(Context);

  if (!value) {
    throw new Error(
      'useFiles must be used inside FilesProvider'
    );
  }

  return value;
}