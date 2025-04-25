import sys
import os
import shutil
from pathlib import Path


class UpdateFiles:
    """
    Class that manages updates and keeps files equals for
    all Simbiose APIs.

    Attributes
    ----------
    source : str
        source directory for copying files
    """

    def __init__(self, source: str) -> None:
        """
        Constructs all the necessary attributes for the update object.

        Parameters
        ----------
            source : str
                source directory for copying files
        """

        self.__path_base = source
        self.__full_name_path = "icon-app-api-service-"
        self.__full_path_from_root = str(Path(__file__).parent.parent.absolute())
        self.__path_valids = ["base", "externo", "interno", "metas", "metas-objetivos"]

    @property
    def path_name_base(self):
        """
        Merge names to create directory name

        Returns
        -------
            dir_name : str
                full name directory
        """
        return self.__full_name_path + self.__path_base

    def __update_dir(self, resource: str, destination_path: str) -> None:
        """
        Update destination files based on source files

        Parameters
        ----------
        resource : str
            directory from source path containing then files to be copied
        destination : str
            destination directory that will receive the updated files

        Returns
        -------
        None
        """

        print(50 * "-")
        print(f"[INFO] Atualizando {resource}")

        full_path_source = (
            self.__full_path_from_root + "/" + self.path_name_base + "/" + resource
        )

        files_source = [
            f
            for f in os.listdir(full_path_source)
            if os.path.isfile(os.path.join(full_path_source, f))
        ]
        for file in files_source:
            print(f"[INFO] ---> Atualizando {file}")
            try:
                full_path_file_source = f"{full_path_source}/{file}"
                full_path_file_destination = (
                    f"{self.__full_path_from_root}/{destination_path}/{resource}/{file}"
                )
                shutil.copyfile(full_path_file_source, full_path_file_destination)
            except Exception as e:
                print(f"[ERRO] {e}")

    def run(self) -> None:
        """
        Manages class execution

        Returns
        -------
        None
        """

        if self.__path_base not in self.__path_valids:
            print("[ERRO] PATH INFORMADO É INVÁLIDO")
            return

        print(f"[INFO] Clonando dados com origem em: /{self.path_name_base}")

        paths_valid = [self.__full_name_path + path for path in self.__path_valids]
        folders = [
            name
            for name in os.listdir(self.__full_path_from_root)
            if os.path.isdir(os.path.join(self.__full_path_from_root, name))
        ]

        for dir in folders:
            if dir not in paths_valid:
                continue
            if dir == self.path_name_base:
                continue

            print(50 * "=")
            print(f"[INFO] Iniciando update nos arquivos de /{dir}")
            self.__update_dir("config", dir)


        print(50 * "=")
        print("[INFO] Finalizado com sucesso")
        print(50 * "=")


if __name__ == "__main__":
    try:
        origin = sys.argv[1]
    except Exception as e:
        print(f"[ERRO] Origem ausente")
        exit()

    update = UpdateFiles(origin)
    update.run()
