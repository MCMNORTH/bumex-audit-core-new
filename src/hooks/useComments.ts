import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Comment } from '@/types';

export const useComments = (projectId: string | undefined) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setComments([]);
      setLoading(false);
      return;
    }

    const commentsRef = collection(db, 'comments');
    const q = query(
      commentsRef,
      where('project_id', '==', projectId),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        updated_at: doc.data().updated_at?.toDate() || null,
      })) as Comment[];
      setComments(commentsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching comments:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [projectId]);

  const createComment = useCallback(async (data: {
    project_id: string;
    section_id: string;
    field_id: string;
    parent_comment_id?: string | null;
    author_id: string;
    addressed_to?: string | null;
    content: string;
  }) => {
    try {
      const commentsRef = collection(db, 'comments');
      await addDoc(commentsRef, {
        ...data,
        parent_comment_id: data.parent_comment_id || null,
        addressed_to: data.addressed_to || null,
        created_at: Timestamp.now(),
        updated_at: null,
        resolved: false,
      });
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }, []);

  const markResolved = useCallback(async (commentId: string, resolved: boolean = true) => {
    try {
      const commentRef = doc(db, 'comments', commentId);
      await updateDoc(commentRef, {
        resolved,
        updated_at: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  }, []);

  const getCommentsByField = useCallback((sectionId: string, fieldId: string) => {
    return comments.filter(c => c.section_id === sectionId && c.field_id === fieldId);
  }, [comments]);

  const getCommentsBySection = useCallback((sectionId: string) => {
    return comments.filter(c => c.section_id === sectionId);
  }, [comments]);

  const getCommentsAddressedTo = useCallback((userId: string) => {
    return comments.filter(c => c.addressed_to === userId);
  }, [comments]);

  const getFieldCommentCount = useCallback((sectionId: string, fieldId: string) => {
    return comments.filter(c => c.section_id === sectionId && c.field_id === fieldId && !c.parent_comment_id && !c.resolved).length;
  }, [comments]);

  const getSectionCommentCount = useCallback((sectionId: string) => {
    return comments.filter(c => c.section_id === sectionId && !c.parent_comment_id && !c.resolved).length;
  }, [comments]);

  return {
    comments,
    loading,
    createComment,
    markResolved,
    getCommentsByField,
    getCommentsBySection,
    getCommentsAddressedTo,
    getFieldCommentCount,
    getSectionCommentCount,
  };
};
