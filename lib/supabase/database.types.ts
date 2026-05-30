export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: { [_ in never]: never }
    Views: { [_ in never]: never }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
  public: {
    Tables: {
      var_chuc_vu: {
        Row: {
          cap_bac: number | null
          id: number
          mo_ta: string | null
          phong_ban_id: number | null
          ten_chuc_vu: string
          tg_cap_nhat: string
          tg_tao: string
          thu_tu: number
          trang_thai: string
        }
        Insert: {
          cap_bac?: number | null
          id?: never
          mo_ta?: string | null
          phong_ban_id?: number | null
          ten_chuc_vu: string
          tg_cap_nhat?: string
          tg_tao?: string
          thu_tu?: number
          trang_thai?: string
        }
        Update: {
          cap_bac?: number | null
          id?: never
          mo_ta?: string | null
          phong_ban_id?: number | null
          ten_chuc_vu?: string
          tg_cap_nhat?: string
          tg_tao?: string
          thu_tu?: number
          trang_thai?: string
        }
        Relationships: [
          {
            foreignKeyName: "var_chuc_vu_phong_ban_id_fkey"
            columns: ["phong_ban_id"]
            isOneToOne: false
            referencedRelation: "var_phong_ban"
            referencedColumns: ["id"]
          },
        ]
      }
      var_chi_nhanh: {
        Row: {
          dia_chi: string | null
          dien_thoai: string | null
          email: string | null
          id: number
          ma_chi_nhanh: string | null
          mo_ta: string | null
          ten_chi_nhanh: string
          tg_cap_nhat: string
          tg_tao: string
          thu_tu: number
          trang_thai: string
        }
        Insert: {
          dia_chi?: string | null
          dien_thoai?: string | null
          email?: string | null
          id?: never
          ma_chi_nhanh?: string | null
          mo_ta?: string | null
          ten_chi_nhanh: string
          tg_cap_nhat?: string
          tg_tao?: string
          thu_tu?: number
          trang_thai?: string
        }
        Update: {
          dia_chi?: string | null
          dien_thoai?: string | null
          email?: string | null
          id?: never
          ma_chi_nhanh?: string | null
          mo_ta?: string | null
          ten_chi_nhanh?: string
          tg_cap_nhat?: string
          tg_tao?: string
          thu_tu?: number
          trang_thai?: string
        }
        Relationships: []
      }
      var_nhan_vien: {
        Row: {
          hinh_anh: string | null
          ho_va_ten: string
          id: number
          id_bo_phan: number | null
          id_chuc_vu: number | null
          id_phong_ban: number | null
          ten_tai_khoan: string
          tg_cap_nhat: string
          tg_tao: string
          trang_thai: string
        }
        Insert: {
          hinh_anh?: string | null
          ho_va_ten: string
          id?: never
          id_bo_phan?: number | null
          id_chuc_vu?: number | null
          id_phong_ban?: number | null
          ten_tai_khoan: string
          tg_cap_nhat?: string
          tg_tao?: string
          trang_thai?: string
        }
        Update: {
          hinh_anh?: string | null
          ho_va_ten?: string
          id?: never
          id_bo_phan?: number | null
          id_chuc_vu?: number | null
          id_phong_ban?: number | null
          ten_tai_khoan?: string
          tg_cap_nhat?: string
          tg_tao?: string
          trang_thai?: string
        }
        Relationships: [
          {
            foreignKeyName: "var_nhan_vien_id_bo_phan_fkey"
            columns: ["id_bo_phan"]
            isOneToOne: false
            referencedRelation: "var_phong_ban"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "var_nhan_vien_id_chuc_vu_fkey"
            columns: ["id_chuc_vu"]
            isOneToOne: false
            referencedRelation: "var_chuc_vu"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "var_nhan_vien_id_phong_ban_fkey"
            columns: ["id_phong_ban"]
            isOneToOne: false
            referencedRelation: "var_phong_ban"
            referencedColumns: ["id"]
          },
        ]
      }
      var_nhan_vien_chi_nhanh: {
        Row: {
          chi_nhanh_id: number
          id: number
          nhan_vien_id: number
          tg_tao: string
        }
        Insert: {
          chi_nhanh_id: number
          id?: never
          nhan_vien_id: number
          tg_tao?: string
        }
        Update: {
          chi_nhanh_id?: number
          id?: never
          nhan_vien_id?: number
          tg_tao?: string
        }
        Relationships: [
          {
            foreignKeyName: "var_nhan_vien_chi_nhanh_chi_nhanh_id_fkey"
            columns: ["chi_nhanh_id"]
            isOneToOne: false
            referencedRelation: "var_chi_nhanh"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "var_nhan_vien_chi_nhanh_nhan_vien_id_fkey"
            columns: ["nhan_vien_id"]
            isOneToOne: false
            referencedRelation: "var_nhan_vien"
            referencedColumns: ["id"]
          },
        ]
      }
      var_phan_quyen: {
        Row: {
          chuc_vu_id: number
          id: number
          module_key: string
          quyen: string
          tg_cap_nhat: string
        }
        Insert: {
          chuc_vu_id: number
          id?: never
          module_key: string
          quyen?: string
          tg_cap_nhat?: string
        }
        Update: {
          chuc_vu_id?: number
          id?: never
          module_key?: string
          quyen?: string
          tg_cap_nhat?: string
        }
        Relationships: [
          {
            foreignKeyName: "var_phan_quyen_chuc_vu_id_fkey"
            columns: ["chuc_vu_id"]
            isOneToOne: false
            referencedRelation: "var_chuc_vu"
            referencedColumns: ["id"]
          },
        ]
      }
      var_phong_ban: {
        Row: {
          cap_do: number
          cha_id: number | null
          duong_dan: string
          id: number
          mo_ta: string | null
          ten_phong_ban: string
          tg_cap_nhat: string
          tg_tao: string
          thu_tu: number
          trang_thai: string
        }
        Insert: {
          cap_do?: number
          cha_id?: number | null
          duong_dan?: string
          id?: never
          mo_ta?: string | null
          ten_phong_ban: string
          tg_cap_nhat?: string
          tg_tao?: string
          thu_tu?: number
          trang_thai?: string
        }
        Update: {
          cap_do?: number
          cha_id?: number | null
          duong_dan?: string
          id?: never
          mo_ta?: string | null
          ten_phong_ban?: string
          tg_cap_nhat?: string
          tg_tao?: string
          thu_tu?: number
          trang_thai?: string
        }
        Relationships: [
          {
            foreignKeyName: "var_phong_ban_cha_id_fkey"
            columns: ["cha_id"]
            isOneToOne: false
            referencedRelation: "var_phong_ban"
            referencedColumns: ["id"]
          },
        ]
      }
      tc_danh_muc_tai_chinh: {
        Row: {
          cap_do: number
          cha_id: number | null
          duong_dan: string
          id: number
          loai: string
          ma_danh_muc: string | null
          mo_ta: string | null
          ten_danh_muc: string
          tg_cap_nhat: string
          tg_tao: string
          thu_tu: number
          trang_thai: string
        }
        Insert: {
          cap_do?: number
          cha_id?: number | null
          duong_dan?: string
          id?: never
          loai: string
          ma_danh_muc?: string | null
          mo_ta?: string | null
          ten_danh_muc: string
          tg_cap_nhat?: string
          tg_tao?: string
          thu_tu?: number
          trang_thai?: string
        }
        Update: {
          cap_do?: number
          cha_id?: number | null
          duong_dan?: string
          id?: never
          loai?: string
          ma_danh_muc?: string | null
          mo_ta?: string | null
          ten_danh_muc?: string
          tg_cap_nhat?: string
          tg_tao?: string
          thu_tu?: number
          trang_thai?: string
        }
        Relationships: [
          {
            foreignKeyName: "tc_danh_muc_tai_chinh_cha_id_fkey"
            columns: ["cha_id"]
            isOneToOne: false
            referencedRelation: "tc_danh_muc_tai_chinh"
            referencedColumns: ["id"]
          },
        ]
      }
      sx_danh_muc_hang_hoa: {
        Row: {
          cap_do: number
          cha_id: number | null
          duong_dan: string
          id: number
          ma_danh_muc: string | null
          mo_ta: string | null
          ten_danh_muc: string
          tg_cap_nhat: string
          tg_tao: string
          thu_tu: number
          trang_thai: string
        }
        Insert: {
          cap_do?: number
          cha_id?: number | null
          duong_dan?: string
          id?: never
          ma_danh_muc?: string | null
          mo_ta?: string | null
          ten_danh_muc: string
          tg_cap_nhat?: string
          tg_tao?: string
          thu_tu?: number
          trang_thai?: string
        }
        Update: {
          cap_do?: number
          cha_id?: number | null
          duong_dan?: string
          id?: never
          ma_danh_muc?: string | null
          mo_ta?: string | null
          ten_danh_muc?: string
          tg_cap_nhat?: string
          tg_tao?: string
          thu_tu?: number
          trang_thai?: string
        }
        Relationships: [
          {
            foreignKeyName: "sx_danh_muc_hang_hoa_cha_id_fkey"
            columns: ["cha_id"]
            isOneToOne: false
            referencedRelation: "sx_danh_muc_hang_hoa"
            referencedColumns: ["id"]
          },
        ]
      }
      sx_danh_muc_nguyen_lieu: {
        Row: {
          cap_do: number
          cha_id: number | null
          duong_dan: string
          id: number
          ma_danh_muc: string | null
          mo_ta: string | null
          ten_danh_muc: string
          tg_cap_nhat: string
          tg_tao: string
          thu_tu: number
          trang_thai: string
        }
        Insert: {
          cap_do?: number
          cha_id?: number | null
          duong_dan?: string
          id?: never
          ma_danh_muc?: string | null
          mo_ta?: string | null
          ten_danh_muc: string
          tg_cap_nhat?: string
          tg_tao?: string
          thu_tu?: number
          trang_thai?: string
        }
        Update: {
          cap_do?: number
          cha_id?: number | null
          duong_dan?: string
          id?: never
          ma_danh_muc?: string | null
          mo_ta?: string | null
          ten_danh_muc?: string
          tg_cap_nhat?: string
          tg_tao?: string
          thu_tu?: number
          trang_thai?: string
        }
        Relationships: [
          {
            foreignKeyName: "sx_danh_muc_nguyen_lieu_cha_id_fkey"
            columns: ["cha_id"]
            isOneToOne: false
            referencedRelation: "sx_danh_muc_nguyen_lieu"
            referencedColumns: ["id"]
          },
        ]
      }
      sx_danh_muc_thong_so_do: {
        Row: {
          bat_buoc: boolean
          danh_muc_id: number
          id: number
          thong_so_do_id: number
          tg_cap_nhat: string
          tg_tao: string
          thu_tu: number
        }
        Insert: {
          bat_buoc?: boolean
          danh_muc_id: number
          id?: never
          thong_so_do_id: number
          tg_cap_nhat?: string
          tg_tao?: string
          thu_tu?: number
        }
        Update: {
          bat_buoc?: boolean
          danh_muc_id?: number
          id?: never
          thong_so_do_id?: number
          tg_cap_nhat?: string
          tg_tao?: string
          thu_tu?: number
        }
        Relationships: [
          {
            foreignKeyName: "sx_danh_muc_thong_so_do_danh_muc_id_fkey"
            columns: ["danh_muc_id"]
            isOneToOne: false
            referencedRelation: "sx_danh_muc_hang_hoa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sx_danh_muc_thong_so_do_thong_so_do_id_fkey"
            columns: ["thong_so_do_id"]
            isOneToOne: false
            referencedRelation: "sx_thong_so_do"
            referencedColumns: ["id"]
          },
        ]
      }
      sx_danh_sach_nguyen_lieu: {
        Row: {
          danh_muc_id: number
          dinh_luong_gsm: number | null
          don_vi_tinh: string
          id: number
          kho_vai: string | null
          ma_nguyen_lieu: string
          mau_sac: string | null
          mo_ta: string | null
          ten_nguyen_lieu: string
          thanh_phan: string | null
          tg_cap_nhat: string
          tg_tao: string
          trang_thai: string
          xuat_xu: string | null
        }
        Insert: {
          danh_muc_id: number
          dinh_luong_gsm?: number | null
          don_vi_tinh?: string
          id?: never
          kho_vai?: string | null
          ma_nguyen_lieu: string
          mau_sac?: string | null
          mo_ta?: string | null
          ten_nguyen_lieu: string
          thanh_phan?: string | null
          tg_cap_nhat?: string
          tg_tao?: string
          trang_thai?: string
          xuat_xu?: string | null
        }
        Update: {
          danh_muc_id?: number
          dinh_luong_gsm?: number | null
          don_vi_tinh?: string
          id?: never
          kho_vai?: string | null
          ma_nguyen_lieu?: string
          mau_sac?: string | null
          mo_ta?: string | null
          ten_nguyen_lieu?: string
          thanh_phan?: string | null
          tg_cap_nhat?: string
          tg_tao?: string
          trang_thai?: string
          xuat_xu?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sx_danh_sach_nguyen_lieu_danh_muc_id_fkey"
            columns: ["danh_muc_id"]
            isOneToOne: false
            referencedRelation: "sx_danh_muc_nguyen_lieu"
            referencedColumns: ["id"]
          },
        ]
      }
      sx_danh_sach_san_pham: {
        Row: {
          danh_muc_id: number
          id: number
          ma_san_pham: string
          mo_ta: string | null
          ten_san_pham: string
          tg_cap_nhat: string
          tg_tao: string
          trang_thai: string
        }
        Insert: {
          danh_muc_id: number
          id?: never
          ma_san_pham: string
          mo_ta?: string | null
          ten_san_pham: string
          tg_cap_nhat?: string
          tg_tao?: string
          trang_thai?: string
        }
        Update: {
          danh_muc_id?: number
          id?: never
          ma_san_pham?: string
          mo_ta?: string | null
          ten_san_pham?: string
          tg_cap_nhat?: string
          tg_tao?: string
          trang_thai?: string
        }
        Relationships: [
          {
            foreignKeyName: "sx_danh_sach_san_pham_danh_muc_id_fkey"
            columns: ["danh_muc_id"]
            isOneToOne: false
            referencedRelation: "sx_danh_muc_hang_hoa"
            referencedColumns: ["id"]
          },
        ]
      }
      sx_danh_muc_thuoc_tinh: {
        Row: {
          bat_buoc: boolean
          danh_muc_id: number
          id: number
          tg_cap_nhat: string
          tg_tao: string
          thu_tu: number
          thuoc_tinh_id: number
        }
        Insert: {
          bat_buoc?: boolean
          danh_muc_id: number
          id?: never
          tg_cap_nhat?: string
          tg_tao?: string
          thu_tu?: number
          thuoc_tinh_id: number
        }
        Update: {
          bat_buoc?: boolean
          danh_muc_id?: number
          id?: never
          tg_cap_nhat?: string
          tg_tao?: string
          thu_tu?: number
          thuoc_tinh_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "sx_danh_muc_thuoc_tinh_danh_muc_id_fkey"
            columns: ["danh_muc_id"]
            isOneToOne: false
            referencedRelation: "sx_danh_muc_hang_hoa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sx_danh_muc_thuoc_tinh_thuoc_tinh_id_fkey"
            columns: ["thuoc_tinh_id"]
            isOneToOne: false
            referencedRelation: "sx_thuoc_tinh_hang_hoa"
            referencedColumns: ["id"]
          },
        ]
      }
      sx_san_pham_thuoc_tinh: {
        Row: {
          gia_tri: string
          id: number
          san_pham_id: number
          tg_cap_nhat: string
          tg_tao: string
          thuoc_tinh_id: number
        }
        Insert: {
          gia_tri?: string
          id?: never
          san_pham_id: number
          tg_cap_nhat?: string
          tg_tao?: string
          thuoc_tinh_id: number
        }
        Update: {
          gia_tri?: string
          id?: never
          san_pham_id?: number
          tg_cap_nhat?: string
          tg_tao?: string
          thuoc_tinh_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "sx_san_pham_thuoc_tinh_san_pham_id_fkey"
            columns: ["san_pham_id"]
            isOneToOne: false
            referencedRelation: "sx_danh_sach_san_pham"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sx_san_pham_thuoc_tinh_thuoc_tinh_id_fkey"
            columns: ["thuoc_tinh_id"]
            isOneToOne: false
            referencedRelation: "sx_thuoc_tinh_hang_hoa"
            referencedColumns: ["id"]
          },
        ]
      }
      sx_thong_so_do: {
        Row: {
          don_vi: string
          id: number
          ten_hien_thi: string
          thu_tu: number
          tg_cap_nhat: string
          tg_tao: string
          trang_thai: string
        }
        Insert: {
          don_vi: string
          id?: never
          ten_hien_thi: string
          thu_tu?: number
          tg_cap_nhat?: string
          tg_tao?: string
          trang_thai?: string
        }
        Update: {
          don_vi?: string
          id?: never
          ten_hien_thi?: string
          thu_tu?: number
          tg_cap_nhat?: string
          tg_tao?: string
          trang_thai?: string
        }
        Relationships: []
      }
      sx_thuoc_tinh_hang_hoa: {
        Row: {
          id: number
          ten_hien_thi: string
          thu_tu: number
          tg_cap_nhat: string
          tg_tao: string
          trang_thai: string
        }
        Insert: {
          id?: never
          ten_hien_thi: string
          thu_tu?: number
          tg_cap_nhat?: string
          tg_tao?: string
          trang_thai?: string
        }
        Update: {
          id?: never
          ten_hien_thi?: string
          thu_tu?: number
          tg_cap_nhat?: string
          tg_tao?: string
          trang_thai?: string
        }
        Relationships: []
      }
      tc_tai_khoan: {
        Row: {
          chi_nhanh_id: number | null
          chu_tai_khoan: string | null
          id: number
          loai_quy: string
          ma_ngan_hang_bin: string | null
          ngan_hang: string | null
          so_du_khoi_dau: number
          so_tai_khoan: string | null
          ten_quy: string
          tg_cap_nhat: string
          tg_tao: string
          trang_thai: string
        }
        Insert: {
          chi_nhanh_id?: number | null
          chu_tai_khoan?: string | null
          id?: never
          loai_quy: string
          ma_ngan_hang_bin?: string | null
          ngan_hang?: string | null
          so_du_khoi_dau?: number
          so_tai_khoan?: string | null
          ten_quy: string
          tg_cap_nhat?: string
          tg_tao?: string
          trang_thai?: string
        }
        Update: {
          chi_nhanh_id?: number | null
          chu_tai_khoan?: string | null
          id?: never
          loai_quy?: string
          ma_ngan_hang_bin?: string | null
          ngan_hang?: string | null
          so_du_khoi_dau?: number
          so_tai_khoan?: string | null
          ten_quy?: string
          tg_cap_nhat?: string
          tg_tao?: string
          trang_thai?: string
        }
        Relationships: [
          {
            foreignKeyName: "tc_tai_khoan_chi_nhanh_id_fkey"
            columns: ["chi_nhanh_id"]
            isOneToOne: false
            referencedRelation: "var_chi_nhanh"
            referencedColumns: ["id"]
          },
        ]
      }
      var_thong_tin_to_chuc: {
        Row: {
          dia_chi: string | null
          dien_thoai: string | null
          email: string | null
          id: number
          mo_ta_ngan: string | null
          ten_to_chuc: string
          ten_ung_dung: string
          tg_cap_nhat: string
          tg_tao: string
          url_logo: string | null
          website: string | null
        }
        Insert: {
          dia_chi?: string | null
          dien_thoai?: string | null
          email?: string | null
          id?: number
          mo_ta_ngan?: string | null
          ten_to_chuc: string
          ten_ung_dung?: string
          tg_cap_nhat?: string
          tg_tao?: string
          url_logo?: string | null
          website?: string | null
        }
        Update: {
          dia_chi?: string | null
          dien_thoai?: string | null
          email?: string | null
          id?: number
          mo_ta_ngan?: string | null
          ten_to_chuc?: string
          ten_ung_dung?: string
          tg_cap_nhat?: string
          tg_tao?: string
          url_logo?: string | null
          website?: string | null
        }
        Relationships: []
      }    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_nhan_vien_count_by_chuc_vu: {
        Args: never
        Returns: {
          id_chuc_vu: number
          so_nhan_vien: number
        }[]
      }
      get_nhan_vien_count_by_phong_ban: {
        Args: never
        Returns: {
          id_phong_ban: number
          so_nhan_vien: number
        }[]
      }
      get_nhan_vien_summary: {
        Args: never
        Returns: {
          tong: number
          hoat_dong: number
          khoa: number
        }[]
      }
      get_nhan_vien_page: {
        Args: {
          p_search?: string | null
          p_limit?: number
          p_offset?: number
          p_trang_thai?: string[] | null
          p_id_phong_ban?: number[] | null
          p_id_chuc_vu?: number[] | null
          p_id_chi_nhanh?: number[] | null
          p_order_by?: string
          p_ascending?: boolean
        }
        Returns: {
          id: number
          ten_tai_khoan: string
          ho_va_ten: string
          id_phong_ban: number | null
          id_bo_phan: number | null
          id_chuc_vu: number | null
          trang_thai: string
          tg_tao: string
          tg_cap_nhat: string
          ten_phong_ban: string | null
          ten_bo_phan: string | null
          ten_chuc_vu: string | null
          ten_chi_nhanh: string | null
          total_count: number
        }[]
      }
      get_nhan_vien_stats: {
        Args: {
          p_as_at: string
          p_range_start: string
          p_range_end: string
          p_id_phong_ban?: number[] | null
          p_trang_thai?: string[] | null
        }
        Returns: Json
      }
      get_phong_ban_path_level: {
        Args: { p_cha_id: number | null; p_id: number }
        Returns: {
          cap_do: number
          duong_dan: string
        }[]
      }
      get_tc_danh_muc_tai_chinh_path_level: {
        Args: { p_cha_id: number | null; p_id: number }
        Returns: {
          cap_do: number
          duong_dan: string
        }[]
      }
      get_sx_danh_muc_hang_hoa_path_level: {
        Args: { p_cha_id: number | null; p_id: number }
        Returns: {
          cap_do: number
          duong_dan: string
        }[]
      }
      get_sx_danh_muc_nguyen_lieu_path_level: {
        Args: { p_cha_id: number | null; p_id: number }
        Returns: {
          cap_do: number
          duong_dan: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

export type PublicTableName = keyof Database['public']['Tables']
